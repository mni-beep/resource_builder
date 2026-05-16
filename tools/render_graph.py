#!/usr/bin/env python3
"""
render_graph.py — Headless graph/diagram renderer for teaching resources.

Usage:
  python tools/render_graph.py --spec path/to/spec.json --out path/to/output.png
  python tools/render_graph.py --spec path/to/spec.json --out path/to/output.svg

Reads a JSON spec file describing a graph, circuit, or diagram, renders it
with matplotlib (Agg backend), schemdraw, or svgwrite, and writes a PNG or
SVG file ready for embedding in DOCX (via C.imageFromFile) or PPTX.

Spec format examples below, or run with --example to dump example specs.
"""

import json, sys, os, argparse, math, textwrap
from pathlib import Path

# ── VCAA-compliant matplotlib defaults ──
import matplotlib
matplotlib.use("Agg")  # headless — no GUI required
import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
from matplotlib.patches import FancyArrowPatch, Arc, Circle, FancyBboxPatch
import numpy as np

# ── schemdraw (import after setting Agg backend) ──
import schemdraw
import schemdraw.elements as elm
import warnings
warnings.filterwarnings("ignore", category=UserWarning, module="schemdraw")

# ── svgwrite ──
import svgwrite

# ═══════════════════════════════════════════════════════════════
# VCAA STYLE DEFAULTS
# ═══════════════════════════════════════════════════════════════

VCAA = {
    "font_family": "Calibri",
    "font_size": 11,         # pt
    "title_size": 13,        # pt
    "label_size": 11,        # pt
    "tick_size": 10,         # pt
    "dpi": 300,
    "fig_width": 6.0,        # inches
    "fig_height": 4.0,       # inches
    "line_width": 1.5,
    "grid": True,
    "grid_alpha": 0.3,
    "grid_style": "--",
    "bg_color": "white",
    "fg_color": "black",
    "axes_color": "#333333",
    "grid_color": "#cccccc",
}

# ── matplotlib rcParams ──
plt.rcParams.update({
    "font.family": "sans-serif",
    "font.sans-serif": [VCAA["font_family"], "Arial", "DejaVu Sans"],
    "font.size": VCAA["font_size"],
    "axes.titlesize": VCAA["title_size"],
    "axes.labelsize": VCAA["label_size"],
    "xtick.labelsize": VCAA["tick_size"],
    "ytick.labelsize": VCAA["tick_size"],
    "axes.edgecolor": VCAA["axes_color"],
    "xtick.color": VCAA["axes_color"],
    "ytick.color": VCAA["axes_color"],
    "text.color": VCAA["fg_color"],
    "figure.facecolor": VCAA["bg_color"],
    "axes.facecolor": VCAA["bg_color"],
    "lines.linewidth": VCAA["line_width"],
    "grid.alpha": VCAA["grid_alpha"],
    "grid.linestyle": VCAA["grid_style"],
    "grid.color": VCAA["grid_color"],
    "savefig.dpi": VCAA["dpi"],
    "savefig.bbox": "tight",
    "savefig.pad_inches": 0.1,
})


# ═══════════════════════════════════════════════════════════════
# RENDERER: matplotlib graphs
# ═══════════════════════════════════════════════════════════════

def render_graph(spec, out_path):
    """Render a data-driven graph using matplotlib."""
    w = spec.get("width", VCAA["fig_width"])
    h = spec.get("height", VCAA["fig_height"])
    dpi = spec.get("dpi", VCAA["dpi"])

    fig, ax = plt.subplots(figsize=(w, h), dpi=dpi)

    # ── title & axis labels (italic for variables per VCAA) ──
    if spec.get("title"):
        ax.set_title(spec["title"], fontweight="bold", pad=10)
    if spec.get("xlabel"):
        ax.set_xlabel(spec["xlabel"], fontstyle=spec.get("xlabel_italic", False) and "italic" or "normal")
    if spec.get("ylabel"):
        ax.set_ylabel(spec["ylabel"], fontstyle=spec.get("ylabel_italic", False) and "italic" or "normal")

    # ── grid ──
    if spec.get("grid", VCAA["grid"]):
        ax.grid(True, alpha=VCAA["grid_alpha"], linestyle=VCAA["grid_style"])

    # ── plot each data series ──
    for series in spec.get("series", []):
        label = series.get("label", "")
        x = series.get("x", [])
        y = series.get("y", [])
        style = series.get("style", {})
        plot_type = series.get("type", "line")

        kw = {
            "label": label,
            "color": style.get("color"),
            "linewidth": style.get("linewidth", VCAA["line_width"]),
            "linestyle": style.get("linestyle", "-"),
            "marker": style.get("marker"),
            "markersize": style.get("markersize", 4),
            "alpha": style.get("alpha", 1.0),
        }
        kw = {k: v for k, v in kw.items() if v is not None}

        if plot_type == "scatter":
            scatter_kw = {k: v for k, v in kw.items() if k not in ("linestyle",)}
            if "markersize" in scatter_kw:
                scatter_kw["s"] = scatter_kw.pop("markersize") ** 2  # area ∝ size²
            ax.scatter(x, y, **scatter_kw)
        elif plot_type == "bar":
            ax.bar(x, y, **{k: v for k, v in kw.items() if k not in ("linestyle", "marker", "markersize")})
        elif plot_type == "errorbar":
            yerr = series.get("yerr")
            ax.errorbar(x, y, yerr=yerr, **kw)
        elif plot_type == "fill":
            ax.fill_between(x, y, alpha=style.get("alpha", 0.3), color=style.get("color"))
        else:
            ax.plot(x, y, **kw)

    # ── axis limits ──
    if spec.get("xlim"):
        ax.set_xlim(spec["xlim"])
    if spec.get("ylim"):
        ax.set_ylim(spec["ylim"])

    # ── x-intercept / y-intercept lines ──
    if spec.get("x_intercept_line"):
        ax.axhline(y=0, color="#999999", linewidth=0.8, linestyle="-")
    if spec.get("y_intercept_line"):
        ax.axvline(x=0, color="#999999", linewidth=0.8, linestyle="-")

    # ── annotations ──
    for ann in spec.get("annotations", []):
        ax.annotate(
            ann.get("text", ""),
            xy=(ann.get("x", 0), ann.get("y", 0)),
            xytext=(ann.get("dx", 20), ann.get("dy", 20)),
            textcoords="offset points",
            fontsize=ann.get("fontsize", 9),
            color=ann.get("color", "#555555"),
            arrowprops=dict(arrowstyle="->", color=ann.get("arrow_color", "#888888"), lw=0.8) if ann.get("arrow") else None,
        )

    # ── legend ──
    if spec.get("legend"):
        ax.legend(loc=spec.get("legend_loc", "best"), framealpha=0.9, edgecolor="#cccccc", fontsize=9)

    # ── trend line ──
    if spec.get("trend_line"):
        for tl in spec["trend_line"]:
            x_t = np.array(tl.get("x", []))
            y_t = np.array(tl.get("y", []))
            if len(x_t) >= 2:
                coeffs = np.polyfit(x_t, y_t, tl.get("degree", 1))
                poly = np.poly1d(coeffs)
                x_fit = np.linspace(min(x_t), max(x_t), 100)
                ax.plot(x_fit, poly(x_fit), linestyle="--", color=tl.get("color", "#C00000"),
                        linewidth=tl.get("linewidth", 1.2), label=tl.get("label", ""))

    # ── ticks: ensure clean formatting ──
    ax.tick_params(direction="in", length=4, width=0.8)
    if spec.get("x_ticks"):
        ax.set_xticks(spec["x_ticks"])
    if spec.get("y_ticks"):
        ax.set_yticks(spec["y_ticks"])

    fig.tight_layout()
    fig.savefig(out_path, dpi=dpi)
    plt.close(fig)
    return out_path


# ═══════════════════════════════════════════════════════════════
# RENDERER: schemdraw circuits
# ═══════════════════════════════════════════════════════════════

ELEMENT_MAP = {
    "resistor":        elm.Resistor,
    "resistor_var":    elm.ResistorVar,
    "capacitor":       elm.Capacitor,
    "inductor":        elm.Inductor,
    "diode":           elm.Diode,
    "zener":           elm.Zener,
    "led":             elm.LED,
    "battery":         elm.Battery,
    "battery_cell":    elm.BatteryCell,
    "source_v":        elm.SourceV,
    "source_sin":      elm.SourceSin,
    "source_pulse":    elm.SourcePulse,
    "source_i":        elm.SourceI,
    "ground":          elm.Ground,
    "ground_signal":   elm.GroundSignal,
    "line":            elm.Line,
    "wire":            elm.Wire,
    "dot":             elm.Dot,
    "switch":          elm.Switch,
    "switch_spdt":     elm.SwitchSpdt,
    "switch_dpdt":     elm.SwitchDpdt,
    "meter_v":         elm.MeterV,
    "meter_a":         elm.MeterA,
    "fuse":            elm.Fuse,
    "lamp":            elm.Lamp,
    "motor":           elm.Motor,
    "speaker":         elm.Speaker,
    "mic":             elm.Mic,
    "antenna":         elm.Antenna,
    "transformer":     elm.Transformer,
    "potentiometer":   elm.Potentiometer,
    "thermistor":      elm.Thermistor,
    "photoresistor":   elm.Photoresistor,
    "ldr":             elm.Photoresistor,       # alias
    "photodiode":      elm.Photodiode,
    "npn":             elm.BjtNpn,
    "pnp":             elm.BjtPnp,
    "opamp":           elm.Opamp,
    "button":          elm.Button,
    "buzzer":          elm.Speaker,             # no dedicated buzzer — use speaker
    "solar":           elm.Solar,
    "crystal":         elm.Crystal,
    "relay":           elm.Relay,
    "spark_gap":       elm.SparkGap,
    "neon":            elm.Neon,
    "rectifier":       elm.Rectifier,
    "triac":           elm.Triac,
    "scr":             elm.SCR,
}

DIRECTIONS = {
    "right": "right", "r": "right",
    "left": "left", "l": "left",
    "up": "up", "u": "up",
    "down": "down", "d": "down",
}

def render_circuit(spec, out_path):
    """Render an electrical circuit schematic using schemdraw."""
    w = spec.get("width", VCAA["fig_width"])
    h = spec.get("height", VCAA["fig_height"])
    dpi = spec.get("dpi", VCAA["dpi"])
    filefmt = os.path.splitext(out_path)[1].lower().lstrip(".")

    # Map file extension to schemdraw format
    fmt_map = {".svg": "svg", ".png": "png", ".pdf": "pdf", ".jpg": "jpg"}
    out_fmt = fmt_map.get(os.path.splitext(out_path)[1].lower(), "svg")

    drawing = schemdraw.Drawing(
        file=out_path,
        show=False,
        inches_per_unit=spec.get("unit_scale", 0.5),
    )

    for step in spec.get("elements", []):
        el_name = step.get("element", "line").lower()
        direction = DIRECTIONS.get(step.get("direction", "right"), "right")
        label = step.get("label", "")
        label_loc = step.get("label_loc", "top")
        reverse = step.get("reverse", False)

        el_class = ELEMENT_MAP.get(el_name)
        if el_class is None:
            print(f"  ⚠ Unknown element '{el_name}', using Line")
            el_class = elm.Line

        element = el_class()
        if label:
            element.label(label, loc=label_loc)
        if reverse:
            element.reverse()

        getattr(drawing, "push")() if False else None  # not needed for sequential
        drawing.add(element)

    # schemdraw auto-saves to file when Drawing context exits
    # We need to save manually since we're not using context manager
    drawing.draw()
    drawing.save(out_path)

    return out_path


# ═══════════════════════════════════════════════════════════════
# RENDERER: svgwrite diagrams (force diagrams, ray optics, blocks)
# ═══════════════════════════════════════════════════════════════

def render_diagram(spec, out_path):
    """Render a custom vector diagram using svgwrite."""
    w = spec.get("width", 600)
    h = spec.get("height", 400)
    dwg = svgwrite.Drawing(out_path, size=(w, h), profile="tiny")

    # ── background ──
    if spec.get("background"):
        dwg.add(dwg.rect(insert=(0, 0), size=(w, h), fill=spec["background"]))

    # ── shapes ──
    for shape in spec.get("shapes", []):
        stype = shape.get("type", "rect")
        attrs = shape.get("attrs", {})
        if stype == "rect":
            dwg.add(dwg.rect(**attrs))
        elif stype == "circle":
            dwg.add(dwg.circle(**attrs))
        elif stype == "ellipse":
            dwg.add(dwg.ellipse(**attrs))
        elif stype == "line":
            dwg.add(dwg.line(**attrs))
        elif stype == "polyline":
            dwg.add(dwg.polyline(**attrs))
        elif stype == "polygon":
            dwg.add(dwg.polygon(**attrs))
        elif stype == "path":
            dwg.add(dwg.path(**attrs))

    # ── text labels ──
    for label in spec.get("labels", []):
        text_attrs = label.get("attrs", {})
        dwg.add(dwg.text(label.get("text", ""), **text_attrs))

    # ── arrows (lines with markers) ──
    marker_id = 0
    for arrow in spec.get("arrows", []):
        marker_id += 1
        mid = f"arrow{marker_id}"
        # Define marker
        marker = dwg.marker(
            id=mid,
            insert=(6, 3), size=(6, 6),
            orient="auto",
            markerUnits="userSpaceOnUse"
        )
        marker.add(dwg.polygon(points=[(0, 0), (6, 3), (0, 6)], fill=arrow.get("color", "#333333")))
        dwg.defs.add(marker)

        dwg.add(dwg.line(
            start=arrow["start"],
            end=arrow["end"],
            stroke=arrow.get("color", "#333333"),
            stroke_width=arrow.get("stroke_width", 2),
            marker_end=f"url(#{mid})"
        ))

    dwg.save()
    return out_path


# ═══════════════════════════════════════════════════════════════
# DISPATCHER
# ═══════════════════════════════════════════════════════════════

RENDERERS = {
    "graph": render_graph,
    "circuit": render_circuit,
    "diagram": render_diagram,
}

def render(spec_path, out_path):
    """Load spec and dispatch to the correct renderer."""
    with open(spec_path, "r", encoding="utf-8") as f:
        spec = json.load(f)

    spec_type = spec.get("type", "graph")
    renderer = RENDERERS.get(spec_type)
    if renderer is None:
        print(f"✗ Unknown spec type '{spec_type}'. Known types: {list(RENDERERS.keys())}")
        sys.exit(1)

    out_path = str(out_path)
    os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)
    result = renderer(spec, out_path)
    print(f"✓ Rendered {spec_type} → {result}")
    return result


# ═══════════════════════════════════════════════════════════════
# EXAMPLE SPEC DUMPER
# ═══════════════════════════════════════════════════════════════

def dump_examples():
    """Print example spec files to stdout."""
    examples = {
        "graph_line.json": {
            "type": "graph",
            "title": "I-V Characteristic of an Ohmic Resistor",
            "xlabel": "Voltage (V)",
            "ylabel": "Current (A)",
            "xlabel_italic": True,
            "ylabel_italic": True,
            "width": 6, "height": 4, "dpi": 300,
            "grid": True,
            "x_intercept_line": True,
            "y_intercept_line": True,
            "xlim": [0, 12], "ylim": [0, 0.6],
            "series": [
                {
                    "label": "R = 22 Ω",
                    "type": "scatter",
                    "x": [0, 2, 4, 6, 8, 10],
                    "y": [0, 0.09, 0.18, 0.27, 0.36, 0.45],
                    "style": {"color": "#2B579A", "marker": "o", "markersize": 6}
                }
            ],
            "trend_line": [
                {
                    "label": "Line of best fit",
                    "x": [0, 2, 4, 6, 8, 10],
                    "y": [0, 0.09, 0.18, 0.27, 0.36, 0.45],
                    "degree": 1,
                    "color": "#C00000"
                }
            ],
            "legend": True
        },
        "graph_photoelectric.json": {
            "type": "graph",
            "title": "Photoelectric Effect — K_max vs Frequency",
            "xlabel": "Frequency f (× 10¹⁴ Hz)",
            "ylabel": "K_max (eV)",
            "width": 7, "height": 5, "dpi": 300,
            "grid": True,
            "y_intercept_line": True,
            "xlim": [0, 12], "ylim": [-3, 5],
            "series": [
                {
                    "label": "Sodium",
                    "type": "scatter",
                    "x": [6.0, 7.0, 8.0, 9.0, 10.0],
                    "y": [0.18, 0.59, 1.01, 1.42, 1.84],
                    "style": {"color": "#2B579A", "marker": "s", "markersize": 8}
                }
            ],
            "trend_line": [
                {
                    "label": "K_max = hf − φ",
                    "x": [5.5, 10.5],
                    "y": [0.0, 0.0],
                    "degree": 1,
                    "color": "#C00000"
                }
            ],
            "annotations": [
                {"text": "f₀ ≈ 5.5 × 10¹⁴ Hz", "x": 5.5, "y": -0.5, "dx": 10, "dy": -40, "arrow": True, "fontsize": 9},
                {"text": "gradient = h", "x": 8.0, "y": 1.0, "dx": 40, "dy": 40, "arrow": True, "fontsize": 9}
            ],
            "legend": True
        },
        "circuit_voltage_divider.json": {
            "type": "circuit",
            "width": 6, "height": 4,
            "elements": [
                {"element": "battery", "direction": "up", "label": "9V"},
                {"element": "line", "direction": "right"},
                {"element": "resistor", "direction": "down", "label": "R₁ = 10kΩ"},
                {"element": "line", "direction": "right"},
                {"element": "resistor", "direction": "down", "label": "R₂ = 22kΩ"},
                {"element": "line", "direction": "left"},
                {"element": "ground", "direction": "down"}
            ]
        },
        "diagram_force.json": {
            "type": "diagram",
            "width": 500, "height": 400,
            "background": "#FFFFFF",
            "shapes": [
                {"type": "rect", "attrs": {"insert": [200, 250], "size": [100, 80], "fill": "#E8F0FE", "stroke": "#2B579A", "stroke_width": 2}}
            ],
            "labels": [
                {"text": "Block", "attrs": {"insert": [225, 295], "font_family": "Calibri", "font_size": 14, "fill": "#333333"}},
                {"text": "F_g = mg", "attrs": {"insert": [210, 370], "font_family": "Calibri", "font_size": 12, "fill": "#333333", "font_style": "italic"}}
            ],
            "arrows": [
                {"start": [250, 330], "end": [250, 380], "color": "#C00000", "stroke_width": 2.5},
                {"start": [250, 250], "end": [250, 200], "color": "#2B579A", "stroke_width": 2.5}
            ]
        }
    }

    print("Example spec files (save as .json):\n")
    for fname, spec in examples.items():
        print(f"── {fname} ──")
        print(json.dumps(spec, indent=2))
        print()


# ═══════════════════════════════════════════════════════════════
# CLI
# ═══════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(
        description="render_graph.py — Headless graph/diagram renderer for teaching resources"
    )
    parser.add_argument("--spec", help="Path to JSON spec file")
    parser.add_argument("--out", help="Output file path (.png or .svg)")
    parser.add_argument("--example", action="store_true", help="Dump example spec files to stdout")

    args = parser.parse_args()

    if args.example:
        dump_examples()
        return

    if not args.spec or not args.out:
        parser.error("--spec and --out are required (or use --example to see examples)")

    render(args.spec, args.out)


if __name__ == "__main__":
    main()
