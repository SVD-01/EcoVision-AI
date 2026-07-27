"""
EcoVision AI Visualization Utilities
Generates annotated images, Grad-CAM overlays, bounding box renderings,
and confusion matrix heatmaps for the AI Ops Dashboard and reports.
"""
import io
import random
from typing import List, Dict, Any, Optional, Tuple

try:
    from PIL import Image, ImageDraw, ImageFont
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

from config.settings import WASTE_CATEGORIES


# Color palette for waste categories
CATEGORY_COLORS = {
    "plastic": (34, 211, 238),   # Cyan
    "paper": (253, 230, 138),    # Amber
    "organic": (52, 211, 153),   # Emerald
    "metal": (165, 180, 252),    # Indigo
    "glass": (103, 232, 249),    # Light cyan
    "e-waste": (192, 132, 252),  # Violet
}


def draw_bounding_boxes(
    image_bytes: bytes,
    detections: List[Dict[str, Any]],
    output_format: str = "JPEG",
) -> bytes:
    """
    Draw bounding boxes and labels on an image.
    Returns annotated image as bytes.
    """
    if not HAS_PIL or not image_bytes:
        return image_bytes or b""

    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    draw = ImageDraw.Draw(image)
    w, h = image.size

    for det in detections:
        x = det.get("x", 0) / 100 * w
        y = det.get("y", 0) / 100 * h
        bw = det.get("width", 0) / 100 * w
        bh = det.get("height", 0) / 100 * h
        label = det.get("label", "Unknown")
        confidence = det.get("confidence", 0)
        
        category_id = label.lower().split(" ")[0] if label else "plastic"
        color = CATEGORY_COLORS.get(category_id, (52, 211, 153))

        # Draw rectangle
        draw.rectangle(
            [x, y, x + bw, y + bh],
            outline=color, width=3,
        )

        # Draw label background
        text = f"{label} {confidence}%"
        try:
            font = ImageFont.load_default()
            bbox = draw.textbbox((0, 0), text, font=font)
            tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        except Exception:
            tw, th = len(text) * 7, 14

        draw.rectangle([x, y - th - 8, x + tw + 10, y], fill=color)
        draw.text((x + 5, y - th - 5), text, fill=(0, 0, 0))

    buf = io.BytesIO()
    image.save(buf, format=output_format, quality=95)
    return buf.getvalue()


def generate_gradcam_overlay(
    image_bytes: bytes,
    activation_regions: List[Dict[str, float]],
) -> bytes:
    """
    Generate a Grad-CAM style heatmap overlay on the input image.
    Uses activation region data from explainable AI metadata.
    """
    if not HAS_PIL or not image_bytes:
        return image_bytes or b""

    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    w, h = image.size
    
    # Create heatmap overlay
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    for region in activation_regions:
        cx = region.get("x", 50) / 100 * w
        cy = region.get("y", 50) / 100 * h
        radius = region.get("radius", 10) / 100 * min(w, h)
        intensity = region.get("intensity", 0.5)

        # Draw radial gradient circle
        for r in range(int(radius), 0, -2):
            alpha = int(intensity * 180 * (r / radius))
            ratio = r / radius
            red = int(255 * (1 - ratio))
            green = int(200 * ratio)
            blue = 50
            draw.ellipse(
                [cx - r, cy - r, cx + r, cy + r],
                fill=(red, green, blue, alpha),
            )

    # Composite overlay onto original image
    result = Image.alpha_composite(image.convert("RGBA"), overlay)
    
    buf = io.BytesIO()
    result.convert("RGB").save(buf, format="JPEG", quality=92)
    return buf.getvalue()


def generate_confusion_matrix_image(
    matrix: List[List[int]],
    labels: List[str],
) -> bytes:
    """Generate a confusion matrix heatmap image."""
    if not HAS_PIL:
        return b""

    cell_size = 80
    margin = 120
    n = len(labels)
    w = margin + n * cell_size + 20
    h = margin + n * cell_size + 20
    
    image = Image.new("RGB", (w, h), (3, 7, 18))
    draw = ImageDraw.Draw(image)
    
    max_val = max(max(row) for row in matrix) if matrix else 1
    
    for i in range(n):
        for j in range(n):
            val = matrix[i][j]
            intensity = val / max_val
            
            if i == j:
                color = (int(52 * intensity + 10), int(211 * intensity + 20), int(153 * intensity + 15))
            else:
                color = (int(180 * intensity + 10), int(40 * intensity + 10), int(40 * intensity + 10))
            
            x = margin + j * cell_size
            y = margin + i * cell_size
            draw.rectangle([x, y, x + cell_size - 2, y + cell_size - 2], fill=color)
            
            draw.text((x + cell_size // 3, y + cell_size // 3), str(val), fill=(255, 255, 255))
    
    # Draw labels
    for i, label in enumerate(labels):
        short = label[:8]
        draw.text((5, margin + i * cell_size + cell_size // 3), short, fill=(148, 163, 184))
        draw.text((margin + i * cell_size + 5, margin - 18), short, fill=(148, 163, 184))
    
    buf = io.BytesIO()
    image.save(buf, format="PNG")
    return buf.getvalue()
