---------------------------------------------------------------------------------------------------
-- Export plugin for DCS Data Visualiser
-- Version 1.0
---------------------------------------------------------------------------------------------------

SimToolsExporter = {
    Start = function(self)
        package.path = package.path .. ";.\\LuaSocket\\?.lua"
        package.cpath = package.cpath .. ";.\\LuaSocket\\?.dll"
        socket = require("socket")

        my_init =
            socket.protect(
            function()
                host1 = host1 or "127.0.0.1" -- Communicate with host1 or the local computer
                port1 = port1 or 41230 -- Use port UDP 41230 to send data to
                c = socket.udp()
                c:settimeout(0)
                c:setpeername(host1, port1)
            end
        )
        my_init()
    end,
    AfterNextFrame = function(self)
        local altRad = LoGetAltitudeAboveGroundLevel()
        local pitch, bank, yaw = LoGetADIPitchBankYaw()
        local angular_speed = LoGetAngularVelocity()

        my_send =
            socket.protect(
            function()
                if c then
                    socket.try(
                        c:send(
                            string.format(
                                "{ \"pitch\": \"%.4f\", \"roll\": \"%.4f\", \"yaw\": \"%.4f\", \"rollRate\": \"%.4f\", \"yawRate\": \"%.4f\", \"pitchRate\": \"%.4f\" }",
                                pitch,
                                bank,
                                yaw,
                                angular_speed.x, -- rollRate
                                angular_speed.y, -- yawRate
                                angular_speed.z -- pitchRate
                            )
                        )
                    )
                end
            end
        )
        my_send()
    end,
    Stop = function(self)
        my_close =
            socket.protect(
            function()
                if c then
                    c:close()
                end
            end
        )
        my_close()
    end
}

-- =============
-- Overload any pre-exisiting functions
-- =============

-- Works once just before mission start.
do
    local OriginalStart = LuaExportStart
    LuaExportStart = function()
        SimToolsExporter:Start()
        if OriginalStart then
            OriginalStart()
        end
    end
end

-- Works just after every simulation frame.
do
    local OriginalAfterNextFrame = LuaExportAfterNextFrame
    LuaExportAfterNextFrame = function()
        SimToolsExporter:AfterNextFrame()
        if OriginalAfterNextFrame then
            OriginalAfterNextFrame()
        end
    end
end

-- Works once just after mission stop.
do
    local OriginalStop = LuaExportStop
    LuaExportStop = function()
        SimToolsExporter:Stop()
        if OriginalStop then
            OriginalStop()
        end
    end
end
