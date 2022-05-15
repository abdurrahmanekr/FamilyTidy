package com.familytidy;

import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.SharedPreferences;
import android.os.Build;

import androidx.annotation.RequiresApi;
import androidx.work.PeriodicWorkRequest;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.concurrent.TimeUnit;

@RequiresApi(api = Build.VERSION_CODES.O)
public class UsageManager {
    private static UsageManager instance = null;

    public static UsageManager getInstance() {
        if (instance == null)
            instance = new UsageManager();

        return instance;
    }

    private UsageStatsManager manager;
    private SharedPreferences sharedPreferences;
    public void initialize(UsageStatsManager mng, SharedPreferences shr) {
        manager = mng;
        sharedPreferences = shr;
    }

    public PeriodicWorkRequest setupJob(String userID, String childID) {
        SharedPreferences.Editor edit = sharedPreferences.edit();
        edit.putString("userID", userID);
        edit.putString("childID", childID);
        edit.apply();

        System.out.println("Job ayarlandı");
        return new PeriodicWorkRequest.Builder(StatsUploadJob.class, 15, TimeUnit.MINUTES)
                // Constraints
                .build();
    }

    public WritableArray getStats(long dayStart, long dayEnd, int interval) {
        List<UsageStats> stats = manager.queryUsageStats(interval, dayStart, dayEnd);

        WritableArray result = Arguments.createArray();
        WritableMap model;
        for (UsageStats stat : stats) {
            model = Arguments.createMap();
            model.putString("packageName", stat.getPackageName());
            model.putDouble("firstTimeStamp", stat.getFirstTimeStamp());
            model.putDouble("lastTimeStamp", stat.getLastTimeStamp());
            model.putDouble("lastTimeUsed", stat.getLastTimeUsed());
            model.putDouble("totalTimeInForeground", stat.getTotalTimeInForeground());
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                model.putDouble("lastTimeVisible", stat.getLastTimeVisible());
                model.putDouble("totalTimeVisible", stat.getTotalTimeVisible());
                model.putDouble("lastTimeForegroundServiceUsed", stat.getLastTimeForegroundServiceUsed());
                model.putDouble("totalTimeForegroundServiceUsed", stat.getTotalTimeForegroundServiceUsed());
            }
            result.pushMap(model);
        }

        return result;
    }

    public WritableArray getTodayStats() {
        long todayStart = LocalDate.now().atTime(0, 0, 0).atZone(ZoneId.systemDefault()).toEpochSecond() * 1000;
        long todayEnd = LocalDate.now().atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toEpochSecond() * 1000;

        return getStats(todayStart, todayEnd, UsageStatsManager.INTERVAL_DAILY);
    }

    public WritableArray getAllTimeStats() {
        long todayEnd = LocalDate.now().atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toEpochSecond() * 1000;

        return getStats(0, todayEnd, UsageStatsManager.INTERVAL_YEARLY);
    }
}
