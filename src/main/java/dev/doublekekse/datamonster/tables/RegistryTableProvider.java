package dev.doublekekse.datamonster.tables;

import dev.doublekekse.datamonster.Table;
import net.minecraft.core.Registry;
import net.minecraft.resources.Identifier;
import oshi.util.tuples.Pair;


public class RegistryTableProvider {
    public static <T> Table<?> getTable(Identifier key, Registry<T> registry) {
        var table = new Table<Pair<Identifier, T>>("Registry_" + key.toString().replaceAll("/", "__"));

        table.addColumn("id", (item) -> item.getA().toString());
        table.addColumn("namespace", (item) -> item.getA().getNamespace());
        table.addColumn("path", (item) -> item.getA().getPath());
        table.addColumn("item", (item) -> item.getB().toString());
        table.addColumn("item_class", (item) -> item.getB().getClass().toString());

        for (var item : registry) {
            var id = registry.getKey(item);
            table.addDataRow(new Pair<>(id, item));
        }

        return table;
    }
}
