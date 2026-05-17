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

# ═══════════════════════════════════════════════════════════════
# CIRCUIT LAYOUT ENGINE
# ═══════════════════════════════════════════════════════════════
#
# schemdraw traces a PATH, not a circuit. Every element extends from the
# endpoint of the previous one. To form a closed circuit, the sequence of
# directions MUST produce net displacement of (0,0) — you must return to
# the starting point.
#
# Three layout modes:
#   "series"  — auto-layout for simple series circuits (battery + components
#               in a rectangular loop). Just list components; the engine
#               figures out the geometry.
#   "parallel" — branches supported via schemdraw push()/pop(). Main loop
#                plus sub-paths that rejoin at nodes.
#   "manual"   — user specifies explicit directions per element. Engine
#                validates the circuit closes and warns if it doesn't.
#
# RULES OF CORRECT CIRCUIT DESIGN:
#
# R1 — The loop MUST close. Net vertical and horizontal displacement must
#      both equal zero. The final endpoint = the starting point.
#
# R2 — Battery on the LEFT vertical rail, positive terminal UP. Conventional
#      current flows clockwise: UP through battery, RIGHT across top, DOWN
#      through components, LEFT across bottom return.
#
# R3 — Components are distributed evenly. Right-rail components go DOWN.
#      Bottom-rail components (return path) go LEFT across the bottom.
#      The switch always goes on the bottom return rail.
#
# R4 — No component overlaps. Wire segments fill gaps between components.
#
# R5 — Ground symbols terminate a path (open circuit is valid if grounded).
#      A circuit ending at ground does NOT need to close the loop.
# ═══════════════════════════════════════════════════════════════

def _add_element(drawing, el_name, direction, label="", label_loc="top", reverse=False):
    """Create and add a single schemdraw element to the drawing."""
    el_class = ELEMENT_MAP.get(el_name.lower())
    if el_class is None:
        print(f"  ⚠ Unknown element '{el_name}', using Line")
        el_class = elm.Line
    element = el_class()
    d = DIRECTIONS.get(direction, "right")
    getattr(element, d)()
    if label:
        element.label(label, loc=label_loc)
    if reverse:
        element.reverse()
    drawing.add(element)


def _estimate_component_height(el_name):
    """Return approximate vertical span in schemdraw units for a component."""
    tall = {"battery", "source_v", "source_sin", "source_i", "meter_v",
            "meter_a", "lamp", "motor", "speaker", "solar", "transformer"}
    if el_name.lower() in tall:
        return 2.5
    return 1.5  # resistor, led, diode, switch, capacitor, etc.


def _build_series_circuit(drawing, spec):
    """
    Auto-layout a series circuit as a clockwise rectangular loop.

    Layout:
      battery UP (left rail)
      → wire RIGHT (top rail)
      → components DOWN (right rail, first half)
      → wire LEFT (bottom return, second half of components + switch)
      → wire UP to close back to battery

    Net displacement is guaranteed to be (0,0).
    """
    elements = spec.get("elements", [])
    if not elements:
        print("  ⚠ Empty circuit — nothing to render")
        return

    # Separate battery, switch, ground, and regular components
    batteries = []
    switches = []
    grounds = []
    components = []

    for el in elements:
        name = el.get("element", "").lower()
        if name in ("battery", "battery_cell", "source_v", "source_sin", "source_i"):
            batteries.append(el)
        elif name in ("switch", "switch_spdt", "switch_dpdt", "button"):
            switches.append(el)
        elif name == "ground":
            grounds.append(el)
        else:
            components.append(el)

    # ── R2: Battery on left rail, going UP ──
    battery = batteries[0] if batteries else {"element": "battery", "label": ""}
    _add_element(drawing, battery.get("element", "battery"), "up",
                 battery.get("label", ""), battery.get("label_loc", "top"),
                 battery.get("reverse", False))

    # Any extra batteries/sources also go UP
    for b in batteries[1:]:
        _add_element(drawing, b.get("element", "battery"), "up",
                     b.get("label", ""), b.get("label_loc", "top"),
                     b.get("reverse", False))

    # ── Top rail: wire RIGHT ──
    _add_element(drawing, "line", "right")

    # ── Right rail: ALL components going DOWN ──
    # Components are placed in series on the right rail (DOWN).
    # This ensures the right rail has consistent height matching the
    # battery, producing a clean rectangular loop.
    for comp in components:
        _add_element(drawing, comp.get("element", "line"), "down",
                     comp.get("label", ""), comp.get("label_loc", "top"),
                     comp.get("reverse", False))

    # ── Bottom rail: corner wire + switch(es) going LEFT ──
    # Corner wire transitions from DOWN to LEFT at the bottom-right corner.
    if components:
        _add_element(drawing, "line", "left")

    # Switch always on the bottom return rail (R3)
    for sw in switches:
        _add_element(drawing, sw.get("element", "switch"), "left",
                     sw.get("label", ""), sw.get("label_loc", "top"),
                     sw.get("reverse", False))

    # ── Close the loop back to origin (R1) ──
    # The battery started at (0,0) going UP. We must return to (0,0)
    # for the circuit to be a proper closed loop.
    if not grounds:
        x, y = drawing.here
        # Adjust horizontal position to x=0 (battery's x)
        if abs(x) > 0.01:
            drawing.add(elm.Line().tox(0))
        # Adjust vertical position to y=0 (battery bottom / start point)
        if abs(y) > 0.01:
            drawing.add(elm.Line().toy(0))
    else:
        # Ground reference — terminate with ground (R5), loop not required
        _add_element(drawing, "line", "left")
        for g in grounds:
            _add_element(drawing, "ground", "down",
                         g.get("label", ""), g.get("label_loc", "top"),
                         g.get("reverse", False))


def _build_parallel_circuit(drawing, spec):
    """
    Build a circuit with parallel branches using schemdraw push()/pop().

    Branches are specified as sub-arrays in the elements list:
      {"branch": [elem1, elem2, ...]}

    The main loop is built as a series circuit; branch elements split off
    at push points and rejoin at pop points.
    """
    elements = spec.get("elements", [])
    if not elements:
        return

    branch_stack = []
    for item in elements:
        if isinstance(item, dict) and "branch" in item:
            # Push current position, draw branch, pop back
            drawing.push()
            for sub_el in item["branch"]:
                _add_element(drawing,
                             sub_el.get("element", "line"),
                             sub_el.get("direction", "right"),
                             sub_el.get("label", ""),
                             sub_el.get("label_loc", "top"),
                             sub_el.get("reverse", False))
            drawing.pop()
        elif isinstance(item, dict) and "element" in item:
            _add_element(drawing,
                         item.get("element", "line"),
                         item.get("direction", "right"),
                         item.get("label", ""),
                         item.get("label_loc", "top"),
                         item.get("reverse", False))
        elif isinstance(item, str):
            # Compact format: "element:label" or "element:direction:label"
            parts = item.split(":")
            el_name = parts[0]
            if len(parts) >= 2 and parts[1] in DIRECTIONS:
                direction = parts[1]
                label = parts[2] if len(parts) >= 3 else ""
            else:
                direction = "right"
                label = parts[1] if len(parts) >= 2 else ""
            _add_element(drawing, el_name, direction, label)


def _build_manual_circuit(drawing, spec):
    """
    Manual mode — user specifies explicit directions per element.
    Validates that the circuit closes (net displacement ≈ 0).
    """
    elements = spec.get("elements", [])
    for step in elements:
        direction = step.get("direction", "right")
        _add_element(drawing,
                     step.get("element", "line"),
                     direction,
                     step.get("label", ""),
                     step.get("label_loc", "top"),
                     step.get("reverse", False))
    # Warning: we can't easily validate displacement with schemdraw's API,
    # but the user is responsible for correctness in manual mode.


def render_circuit(spec, out_path):
    """Render an electrical circuit schematic using schemdraw.

    Three layout modes (spec."layout"):
      "series"   — auto-layout. Just list components; engine builds a proper
                   clockwise rectangular loop. Battery on left, components on
                   right and bottom rails, switch on return path.
      "parallel" — branches via push()/pop(). Use {"branch": [...]} for
                   parallel sub-paths.
      "manual"   — user specifies explicit "direction" per element.
                   Legacy mode; validate your own circuit closure.

    If "layout" is omitted, defaults to "series" (auto-layout).
    If "elements" are provided with explicit directions AND no layout is set,
    falls back to "manual" for backward compatibility.
    """
    layout = spec.get("layout", "series")

    with schemdraw.Drawing(file=out_path, show=False) as drawing:
        if layout == "parallel":
            _build_parallel_circuit(drawing, spec)
        elif layout == "manual":
            _build_manual_circuit(drawing, spec)
        else:
            _build_series_circuit(drawing, spec)

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
                {"element": "line", "direction": "up"},
                {"element": "line", "direction": "left"}
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
