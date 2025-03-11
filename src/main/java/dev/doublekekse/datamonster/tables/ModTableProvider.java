package dev.doublekekse.datamonster.tables;

import dev.doublekekse.datamonster.Table;
import net.fabricmc.loader.api.FabricLoader;
import net.fabricmc.loader.api.ModContainer;
import net.fabricmc.loader.api.metadata.Person;

import java.util.stream.Collectors;

public class ModTableProvider {
    public static Table<?> getTable() {
        var table = new Table<ModContainer>("Mod");

        table.addColumn("id", mod -> mod.getMetadata().getId());
        table.addColumn("name", mod -> mod.getMetadata().getName());
        table.addColumn("description", mod -> mod.getMetadata().getDescription());
        table.addColumn("authors", mod -> mod.getMetadata().getAuthors().stream().map(Person::getName).collect(Collectors.joining(", ")));
        table.addColumn("version", mod -> mod.getMetadata().getVersion().getFriendlyString());

        FabricLoader.getInstance().getAllMods().forEach(table::addDataRow);

        return table;
    }
}
