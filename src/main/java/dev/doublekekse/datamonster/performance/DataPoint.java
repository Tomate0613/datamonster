package dev.doublekekse.datamonster.performance;

public class DataPoint {
    public double avgRenderTimeMs;
    public double minRenderTimeMs;
    public double maxRenderTimeMs;
    public int totalSamples;

    void addSample(double renderTimeMs) {
        avgRenderTimeMs = ((avgRenderTimeMs * totalSamples) + renderTimeMs) / (totalSamples + 1);
        minRenderTimeMs = totalSamples == 0 ? renderTimeMs : Math.min(minRenderTimeMs, renderTimeMs);
        maxRenderTimeMs = Math.max(maxRenderTimeMs, renderTimeMs);
        totalSamples++;
    }
}
