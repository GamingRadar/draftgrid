/**
 * TriangleEngine.js
 * Simplified logic for DraftGrid 2D Triangle.
 * Renders a symmetric isosceles triangle fitting the current box dimensions/scale.
 */
const TriangleEngine = {
    // No longer needs specialized validation for side lengths
    validate() {
        return true;
    },

    draw(ctx, x, y, w, h, state, scale2D) {
        ctx.beginPath();
        const cx = x + w / 2, cy = y + h / 2;
        const sF = scale2D / 100;

        // Symmetric Isosceles Triangle fitting the bounding box
        const drawW = w * sF;
        const drawH = h * sF;

        const topX = cx;
        const topY = cy - drawH / 2;
        const bottomY = cy + drawH / 2;
        const leftX = cx - drawW / 2;
        const rightX = cx + drawW / 2;

        ctx.moveTo(topX, topY);
        ctx.lineTo(rightX, bottomY);
        ctx.lineTo(leftX, bottomY);
        ctx.closePath();

        ctx.stroke();
    }
};
