package dev.doublekekse.datamonster.command;

import com.mojang.brigadier.CommandDispatcher;
import dev.doublekekse.datamonster.Datamonster;
import net.fabricmc.fabric.api.client.command.v2.FabricClientCommandSource;
import net.minecraft.commands.CommandBuildContext;
import net.minecraft.network.chat.Component;

import static net.fabricmc.fabric.api.client.command.v2.ClientCommandManager.literal;

public class DatamonsterCommand {

    public static void register(CommandDispatcher<FabricClientCommandSource> dispatcher, CommandBuildContext commandBuildContext) {
        dispatcher.register(
            literal("datamonster").then(literal("export").executes(ctx -> {
                try {
                    var tables = Datamonster.getTables();
                    var s = 0;

                    for (var table : tables) {
                        try {
                            table.export();
                            s++;

                            ctx.getSource().sendFeedback(Component.literal("Exported table " + table.name));
                        } catch (Exception ignored) {
                            ctx.getSource().sendError(Component.literal("Failed to export table " + table.name));
                        }
                    }

                    ctx.getSource().sendFeedback(Component.literal("Export done"));

                    return s;
                } catch (Exception e) {
                    e.printStackTrace();
                    return 1;
                }
            }))
        );
    }
}
