package dev.doublekekse.datamonster.tables;

import dev.doublekekse.area_lib.Area;
import dev.doublekekse.area_lib.data.AreaClientData;
import dev.doublekekse.datamonster.Table;
import net.minecraft.Optionull;
import net.minecraft.world.phys.AABB;

import java.util.function.Function;


public class AreaLibTableProvider {
    public static Table<?> getTable() {
        var table = new Table<Area>("Area");

        table.addColumn("id", area -> area.getId().toString());
        table.addColumn("priority", area -> String.valueOf(area.getPriority()));
        table.addColumn("type", area -> area.getType().toString());

        table.addColumn("minX", area -> String.valueOf(Optionull.map(area.getBoundingBox(), (Function<AABB, Double>) aabb -> aabb.getMinPosition().x)));
        table.addColumn("minY", area -> String.valueOf(Optionull.map(area.getBoundingBox(), (Function<AABB, Double>) aabb -> aabb.minY)));
        table.addColumn("minZ", area -> String.valueOf(Optionull.map(area.getBoundingBox(), (Function<AABB, Double>) aabb -> aabb.minZ)));

        table.addColumn("maxX", area -> String.valueOf(Optionull.map(area.getBoundingBox(), (Function<AABB, Double>) aabb -> aabb.maxX)));
        table.addColumn("maxY", area -> String.valueOf(Optionull.map(area.getBoundingBox(), (Function<AABB, Double>) aabb -> aabb.maxY)));
        table.addColumn("maxZ", area -> String.valueOf(Optionull.map(area.getBoundingBox(), (Function<AABB, Double>) aabb -> aabb.maxZ)));

        AreaClientData.getClientLevelData().getAreas().forEach(table::addDataRow);

        return table;
    }
}
