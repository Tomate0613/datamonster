package dev.doublekekse.datamonster.mixin;

import dev.doublekekse.datamonster.Datamonster;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.components.DebugScreenOverlay;
import org.spongepowered.asm.mixin.Final;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.Shadow;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

@Mixin(DebugScreenOverlay.class)
public class DebugScreenOverlayMixin {
    @Shadow
    @Final
    private Minecraft minecraft;

    @Inject(method = "logFrameDuration", at = @At("HEAD"))
    void logFrameDuration(long l, CallbackInfo ci) {
        var player = minecraft.player;

        if (player == null) {
            return;
        }

        Datamonster.dataGrid.track(player.position(), l / 1_000_000.0);
    }
}
