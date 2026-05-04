package dev.doublekekse.datamonster.tables;

import dev.doublekekse.datamonster.Table;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.network.chat.contents.TranslatableContents;
import net.minecraft.resources.Identifier;
import net.minecraft.world.item.Item;
import net.minecraft.world.item.ItemStack;
import oshi.util.tuples.Pair;


public class ItemsTableProvider {
    public static Table<?> getTable() {
        var table = new Table<Pair<Identifier, Item>>("Item");

        table.addColumn("id", item -> item.getA().toString());
        table.addColumn("namespace", item -> item.getA().getNamespace());
        table.addColumn("path", item -> item.getA().getPath());

        table.addColumn("name", item -> new ItemStack(item.getB()).getDisplayName().getString());
        table.addColumn("name_has_translation", item -> {
            var name = new ItemStack(item.getB()).getDisplayName();

            if (name instanceof TranslatableContents component) {
                return String.valueOf(!component.getKey().equals(name.getString()));
            }

            return "true";
        });

        for (var item : BuiltInRegistries.ITEM) {
            var id = BuiltInRegistries.ITEM.getKey(item);

            table.addDataRow(new Pair<>(id, item));
        }

        return table;
    }
}
