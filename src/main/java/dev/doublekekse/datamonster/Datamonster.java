package dev.doublekekse.datamonster;

import dev.doublekekse.datamonster.command.DatamonsterCommand;
import dev.doublekekse.datamonster.performance.DataGrid;
import dev.doublekekse.datamonster.tables.*;
import net.fabricmc.api.ModInitializer;
import net.fabricmc.fabric.api.client.command.v2.ClientCommandRegistrationCallback;
import net.fabricmc.loader.api.FabricLoader;
import net.minecraft.core.Registry;
import net.minecraft.core.RegistryAccess;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.resources.ResourceLocation;

import java.util.ArrayList;
import java.util.List;

public class Datamonster implements ModInitializer {
    public static DataGrid dataGrid = new DataGrid();

    @Override
    public void onInitialize() {
        ClientCommandRegistrationCallback.EVENT.register(DatamonsterCommand::register);
    }

    public static List<Table<?>> getTables() {
        var tables = new ArrayList<Table<?>>();

        tables.add(ModTableProvider.getTable());
        tables.add(PerformanceTable.getTable());
        tables.add(ItemsTableProvider.getTable());

        BuiltInRegistries.REGISTRY.forEach(registry -> {
            @SuppressWarnings("unchecked") var key = ((Registry<Registry<?>>) BuiltInRegistries.REGISTRY).getKey(registry);
            assert key != null;
            tables.add(RegistryTableProvider.getTable(key, registry));
        });

        tables.add(RegistryTableProvider.getTable(ResourceLocation.withDefaultNamespace("registry"), BuiltInRegistries.REGISTRY));

        if (FabricLoader.getInstance().isModLoaded("scattered_shards")) {
            tables.add(ScatteredShardsTableProvider.getTable());
        }

        if (FabricLoader.getInstance().isModLoaded("area_lib")) {
            tables.add(AreaLibTableProvider.getTable());
        }

        return tables;
    }
}
