package dev.doublekekse.datamonster;

import dev.doublekekse.datamonster.command.DatamonsterCommand;
import dev.doublekekse.datamonster.tables.AreaLibTableProvider;
import dev.doublekekse.datamonster.tables.ModTableProvider;
import dev.doublekekse.datamonster.tables.ScatteredShardsTableProvider;
import net.fabricmc.api.ModInitializer;
import net.fabricmc.fabric.api.client.command.v2.ClientCommandRegistrationCallback;
import net.fabricmc.loader.api.FabricLoader;

import java.util.ArrayList;
import java.util.List;

public class Datamonster implements ModInitializer {
    @Override
    public void onInitialize() {
        ClientCommandRegistrationCallback.EVENT.register(DatamonsterCommand::register);
    }

    public static List<Table<?>> getTables() {
        var tables = new ArrayList<Table<?>>();

        tables.add(ModTableProvider.getTable());

        if (FabricLoader.getInstance().isModLoaded("scattered_shards")) {
            tables.add(ScatteredShardsTableProvider.getTable());
        }

        if (FabricLoader.getInstance().isModLoaded("area_lib")) {
            tables.add(AreaLibTableProvider.getTable());
        }

        return tables;
    }
}
