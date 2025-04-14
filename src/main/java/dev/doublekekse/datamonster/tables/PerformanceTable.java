package dev.doublekekse.datamonster.tables;

import dev.doublekekse.datamonster.Datamonster;
import dev.doublekekse.datamonster.Table;
import dev.doublekekse.datamonster.performance.DataPoint;
import org.joml.Vector2i;

import java.util.Map;

public class PerformanceTable {
    public static Table<?> getTable() {
        var table = new Table<Map.Entry<Vector2i, DataPoint>>("Performance");
        var grid = Datamonster.dataGrid;

        table.addColumn("x", entry -> String.valueOf(entry.getKey().x * grid.GRID_SIZE));
        table.addColumn("z", entry -> String.valueOf(entry.getKey().y * grid.GRID_SIZE));

        table.addColumn("avgRenderTimeMs", entry -> String.valueOf(entry.getValue().avgRenderTimeMs));
        table.addColumn("minRenderTimeMs", entry -> String.valueOf(entry.getValue().minRenderTimeMs));
        table.addColumn("maxRenderTimeMs", entry -> String.valueOf(entry.getValue().maxRenderTimeMs));
        table.addColumn("totalSamples", entry -> String.valueOf(entry.getValue().totalSamples));

        grid.points.entrySet().forEach(table::addDataRow);

        return table;
    }
}
