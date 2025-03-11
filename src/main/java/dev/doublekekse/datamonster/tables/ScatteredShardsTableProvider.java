package dev.doublekekse.datamonster.tables;

import dev.doublekekse.datamonster.Table;
import net.modfest.scatteredshards.api.ScatteredShardsAPI;
import net.modfest.scatteredshards.api.shard.Shard;

public class ScatteredShardsTableProvider {
    public static Table<?> getTable() {
        var shardTable = new Table<Shard>("Shard");

        shardTable.addColumn("id", (shard -> ScatteredShardsAPI.getClientLibrary().shards().get(shard).get().getNamespace()));
        shardTable.addColumn("name", (shard) -> shard.name().getString());
        shardTable.addColumn("lore", (shard) -> shard.lore().getString());
        shardTable.addColumn("type", (shard) -> shard.shardTypeId().getPath());
        shardTable.addColumn("collected", (shard) -> {
            var id = ScatteredShardsAPI.getClientLibrary().shards().get(shard).get();
            var progress = ScatteredShardsAPI.getClientGlobalCollection().getCount(id);

            return Integer.toString(progress);
        });

        ScatteredShardsAPI.getClientLibrary().shards().forEach((shardId, shard) -> shardTable.addDataRow(shard));

        return shardTable;
    }
}
