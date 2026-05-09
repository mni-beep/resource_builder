#!/usr/bin/env python3
"""
download_image.py — Reliable image downloader for teaching resource images.

Usage:
  python tools/download_image.py <URL> <output_path> [--referer <url>]
  python tools/download_image.py --scrape <page_url> <output_path>

Sources supported:
    - Any direct image URL (via requests with browser UA)
    - Wikimedia Commons file pages (extracts og:image thumbnail)
    - OpenClipart detail pages (finds PNG download URL)
    - PHIL / CDC detail pages (predictable direct image URL)
    - JS-rendered pages such as OpenStax, Pixabay, Desmos, and NASA via browser fallback

Exit codes: 0=success, 1=usage error, 2=manual/browser assistance still required
"""

import sys
import os
import argparse
import re
import shutil
import subprocess
import time
from pathlib import Path
from urllib.parse import urlparse, urljoin

import requests
from bs4 import BeautifulSoup

# ── Browser-like headers to avoid 403/429 blocks ──────────────────────────
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/125.0.0.0 Safari/537.36"
    ),
    "Accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.google.com/",
}

BROWSER_FIRST_HOSTS = (
    "openstax.org",
    "pixabay.com",
    "desmos.com",
    "tinkercad.com",
    "earthobservatory.nasa.gov",
    "science.nasa.gov",
    "nasa.gov",
)

# ── Utility functions ─────────────────────────────────────────────────────

def download_direct(url, out_path, headers=None, timeout=30):
    """Download a direct image URL to out_path. Returns True on success."""
    h = {**HEADERS, **(headers or {})}
    try:
        resp = requests.get(url, headers=h, timeout=timeout, stream=True)
        resp.raise_for_status()

        # Check we actually got an image, not an HTML page
        ct = resp.headers.get("content-type", "").lower()
        if "html" in ct:
            print(f"FAIL (not an image): got HTML page from {url}", file=sys.stderr)
            return False
        if "text/" in ct and "image/" not in ct and "svg" not in ct:
            print(f"FAIL (not an image): got {ct} from {url}", file=sys.stderr)
            return False

        # Double-check: if content starts with <!DOCTYPE or <html, it's HTML
        chunk = resp.content[:200]
        if chunk.strip().startswith(b"<!DOCTYPE") or chunk.strip().startswith(b"<html") or chunk.strip().startswith(b"<!"):
            print(f"FAIL (not an image): response is HTML", file=sys.stderr)
            return False

        Path(os.path.dirname(out_path) or ".").mkdir(parents=True, exist_ok=True)
        with open(out_path, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)

        size_kb = os.path.getsize(out_path) / 1024
        print(f"OK: {out_path} ({size_kb:.1f} KB)")
        return True

    except requests.RequestException as e:
        print(f"FAIL (direct): {e}", file=sys.stderr)
        return False


# ── Source-specific scrapers ──────────────────────────────────────────────

def scrape_wikimedia(page_url, out_path):
    """
    Wikimedia Commons file page → download thumbnail PNG.
    E.g. https://commons.wikimedia.org/wiki/File:Ohm%27s_Law_with_Triangle.svg
    """
    try:
        resp = requests.get(page_url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
    except requests.RequestException as e:
        print(f"FAIL (wikimedia page): {e}", file=sys.stderr)
        return False

    soup = BeautifulSoup(resp.text, "html.parser")

    # Strategy 1: Find the fullMedia link or og:image
    og_image = soup.find("meta", property="og:image")
    if og_image and og_image.get("content"):
        img_url = og_image["content"]
        print(f"Found og:image: {img_url}")
        return download_direct(img_url, out_path)

    # Strategy 2: Find .fullImageLink img or .fullMedia a
    full_link = soup.select_one(".fullImageLink img, .fullMedia a")
    if full_link:
        src = full_link.get("src") or full_link.get("href")
        if src:
            img_url = urljoin(page_url, src)
            print(f"Found fullImageLink: {img_url}")
            return download_direct(img_url, out_path)

    # Strategy 3: Find any large image
    for img in soup.find_all("img"):
        src = img.get("src", "")
        if "upload.wikimedia.org" in src and "thumb" in src:
            # Wikimedia thumbnail — try to get a larger version
            img_url = urljoin(page_url, src)
            print(f"Found wikimedia thumb: {img_url}")
            return download_direct(img_url, out_path)

    print("FAIL (wikimedia): could not find image URL", file=sys.stderr)
    return False


def scrape_openclipart(page_url, out_path):
    """
    OpenClipart detail page → download PNG.
    E.g. https://openclipart.org/detail/194747/simple-circuit
    """
    try:
        resp = requests.get(page_url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
    except requests.RequestException as e:
        print(f"FAIL (openclipart page): {e}", file=sys.stderr)
        return False

    soup = BeautifulSoup(resp.text, "html.parser")

    # Strategy 1: Find the image itself — usually an img with the artwork
    for img in soup.find_all("img"):
        src = img.get("src", "")
        parent_class = " ".join(img.parent.get("class", [])) if img.parent else ""
        if "download" in src.lower() or "png" in src.lower() or "detail" in src.lower():
            img_url = urljoin(page_url, src)
            print(f"Found openclipart image: {img_url}")
            return download_direct(img_url, out_path)

    # Strategy 2: Look for download links
    for a in soup.find_all("a"):
        href = a.get("href", "")
        text = a.get_text(strip=True).lower()
        if ("png" in href.lower() or "download" in href.lower()) and \
           any(s in text for s in ("png", "download", "small", "medium", "large")):
            img_url = urljoin(page_url, href)
            print(f"Found openclipart download: {img_url}")
            return download_direct(img_url, out_path)

    # Strategy 3: og:image
    og_image = soup.find("meta", property="og:image")
    if og_image and og_image.get("content"):
        img_url = og_image["content"]
        print(f"Found openclipart og:image: {img_url}")
        return download_direct(img_url, out_path)

    print("FAIL (openclipart): could not find image URL", file=sys.stderr)
    return False


def scrape_pixabay(page_url, out_path):
    """
    Pixabay photo page → download image.
    """
    try:
        resp = requests.get(page_url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
    except requests.RequestException as e:
        print(f"FAIL (pixabay page): {e}", file=sys.stderr)
        return False

    soup = BeautifulSoup(resp.text, "html.parser")

    # Pixabay loads images via JavaScript — try og:image first
    og_image = soup.find("meta", property="og:image")
    if og_image and og_image.get("content"):
        img_url = og_image["content"]
        print(f"Found pixabay og:image: {img_url}")
        # Pixabay CDN needs a referer header
        return download_direct(img_url, out_path, headers={"Referer": page_url})

    print("FAIL (pixabay): could not find image URL (JS-rendered)", file=sys.stderr)
    return False


def scrape_openstax(page_url, out_path):
    """
    OpenStax page → download image.
    OpenStax is a SPA — likely needs browser fallback.
    """
    try:
        resp = requests.get(page_url, headers=HEADERS, timeout=15)
        resp.raise_for_status()
    except requests.RequestException as e:
        print(f"FAIL (openstax page): {e}", file=sys.stderr)
        return False

    soup = BeautifulSoup(resp.text, "html.parser")

    # Try og:image
    og_image = soup.find("meta", property="og:image")
    if og_image and og_image.get("content"):
        img_url = og_image["content"]
        print(f"Found openstax og:image: {img_url}")
        return download_direct(img_url, out_path)

    # Try to find image URLs in the page source
    for img in soup.find_all("img"):
        src = img.get("src", "")
        if any(ext in src.lower() for ext in (".png", ".jpg", ".jpeg", ".webp", ".svg")):
            if not any(skip in src.lower() for skip in ("logo", "icon", "avatar")):
                img_url = urljoin(page_url, src)
                print(f"Found openstax image: {img_url}")
                return download_direct(img_url, out_path)

    print("FAIL (openstax): SPA — needs browser fallback", file=sys.stderr)
    return False


def scrape_phil(page_url, out_path):
    """
    PHIL / CDC details page → predictable low-res JPEG.
    Example: https://phil.cdc.gov/Details.aspx?pid=23312
    """
    match = re.search(r"pid=(\d+)", page_url, re.IGNORECASE)
    if not match:
        match = re.search(r"/(\d+)(?:\D|$)", page_url)
    if not match:
        print("FAIL (PHIL): could not determine image id from URL", file=sys.stderr)
        return False

    image_id = match.group(1)
    direct_url = f"https://wwwn.cdc.gov/phil/PHIL_Images/{image_id}/{image_id}_lores.jpg"
    print(f"Found PHIL direct image: {direct_url}")
    return download_direct(direct_url, out_path)


def browser_fallback(url, out_path):
    """Use the Playwright helper for JS-rendered pages or screenshot-only sources."""
    node_bin = shutil.which("node")
    helper = Path(__file__).with_name("browser_image_helper.cjs")
    if not node_bin or not helper.exists():
        return False

    host = (urlparse(url).hostname or "").lower()
    screenshot_hosts = (
        "desmos.com",
        "tinkercad.com",
    )
    download_hosts = (
        "openstax.org",
        "pixabay.com",
        "earthobservatory.nasa.gov",
        "science.nasa.gov",
        "nasa.gov",
    )
    blocked_hosts = (
        "loc.gov",
        "davidrumsey.com",
        "fritzing.org",
    )

    if any(domain in host for domain in blocked_hosts):
        print(f"FAIL (browser fallback unavailable): {host} still requires manual access", file=sys.stderr)
        return False

    mode = None
    if any(domain in host for domain in screenshot_hosts):
        mode = "screenshot"
    elif any(domain in host for domain in download_hosts):
        mode = "download"
    else:
        return False

    command = [node_bin, str(helper), mode, url, out_path, "--wait", "3000"]
    print(f"Browser fallback via {mode}: {' '.join(command)}")
    result = subprocess.run(command, capture_output=True, text=True)
    if result.stdout:
        print(result.stdout.rstrip())
    if result.stderr:
        print(result.stderr.rstrip(), file=sys.stderr)
    return result.returncode == 0


# ── Source router ─────────────────────────────────────────────────────────

SCRAPERS = [
    ("cdn.pixabay.com", lambda url, out: download_direct(url, out, headers={"Referer": "https://pixabay.com/"})),
    ("commons.wikimedia.org", scrape_wikimedia),
    ("openclipart.org", scrape_openclipart),
    ("phil.cdc.gov", scrape_phil),
    ("wwwn.cdc.gov", scrape_phil),
    ("pixabay.com", scrape_pixabay),
    ("openstax.org", scrape_openstax),
    ("upload.wikimedia.org", lambda url, out: download_direct(url, out)),
]


def detect_source(url):
    """Return the scraper function for this URL, or None for direct download."""
    host = urlparse(url).hostname or ""
    for domain, scraper in SCRAPERS:
        if domain in host:
            return scraper
    return None


# ── Main ──────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Download images for teaching resources")
    parser.add_argument("url", help="Image URL or page URL (with --scrape)")
    parser.add_argument("output", help="Output file path")
    parser.add_argument("--scrape", action="store_true", help="Scrape image from a page (not a direct image URL)")
    parser.add_argument("--referer", default=None, help="Referer header to send with the request")
    args = parser.parse_args()

    url = args.url
    out_path = args.output
    scrape_mode = args.scrape
    extra_headers = {}
    if args.referer:
        extra_headers["Referer"] = args.referer

    host = urlparse(url).hostname or ""
    dl = lambda u, o: download_direct(u, o, headers=extra_headers if extra_headers else None)

    if scrape_mode and any(domain in host.lower() for domain in BROWSER_FIRST_HOSTS):
        if browser_fallback(url, out_path):
            sys.exit(0)

    # Step 1: Try source-specific scraper if available
    scraper = detect_source(url)
    if scraper and scraper is not download_direct:
        print(f"Scraping {host} → {out_path}")
        if scraper(url, out_path):
            sys.exit(0)

    # Step 2: Try direct download (for direct image URLs)
    print(f"Direct download {url} → {out_path}")
    if download_direct(url, out_path, headers=extra_headers if extra_headers else None):
        sys.exit(0)

    # Step 3: If --scrape mode, try to extract image from the page
    if scrape_mode:
        try:
            resp = requests.get(url, headers=HEADERS, timeout=15)
            resp.raise_for_status()
            soup = BeautifulSoup(resp.text, "html.parser")

            # Try og:image
            og = soup.find("meta", property="og:image")
            if og and og.get("content"):
                img_url = og["content"]
                print(f"Generic og:image: {img_url}")
                if download_direct(img_url, out_path, headers=extra_headers if extra_headers else None):
                    sys.exit(0)

            # Try the first non-icon image on the page
            for img in soup.find_all("img"):
                src = img.get("src", "")
                if src and not src.startswith("data:"):
                    if not any(s in src.lower() for s in ("logo", "icon", "avatar", "pixel")):
                        img_url = urljoin(url, src)
                        print(f"Generic image attempt: {img_url}")
                        if download_direct(img_url, out_path, headers=extra_headers if extra_headers else None):
                            sys.exit(0)

        except Exception as e:
            print(f"FAIL (generic scrape): {e}", file=sys.stderr)

        if browser_fallback(url, out_path):
            sys.exit(0)

    # Step 4: Nothing worked — signal for browser fallback
    print(f"FALLBACK: {url}", file=sys.stderr)
    sys.exit(2)


if __name__ == "__main__":
    main()
