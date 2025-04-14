package dev.doublekekse.datamonster.performance;

import net.minecraft.world.phys.Vec3;
import org.joml.Vector2i;

import java.util.HashMap;
import java.util.Map;

public class DataGrid {
    public Map<Vector2i, DataPoint> points = new HashMap<>();
    public final int GRID_SIZE = 16;

    public void track(Vec3 position, double renderTimeMs) {
        final int gridX = (int) Math.floor(position.x / GRID_SIZE);
        final int gridZ = (int) Math.floor(position.z / GRID_SIZE);

        final var key = new Vector2i(gridX, gridZ);

        points.putIfAbsent(key, new DataPoint());
        points.get(key).addSample(renderTimeMs);
    }
}
