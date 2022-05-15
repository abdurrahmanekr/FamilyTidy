package com.familytidy;

import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import com.facebook.react.bridge.WritableArray;
import com.google.firebase.FirebaseApp;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@RequiresApi(api = Build.VERSION_CODES.O)
public class StatsUploadJob extends Worker {
    private static final DateTimeFormatter dateFormat = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final DateTimeFormatter yearDateFormat = DateTimeFormatter.ofPattern("yyyy");

    private final DatabaseReference mDatabase;
    private final SharedPreferences sharedPreferences;
    public StatsUploadJob(@NonNull Context context, @NonNull WorkerParameters workerParams) {
        super(context, workerParams);

        System.out.println("Construct çalıştı");

        FirebaseApp.initializeApp(context);

        mDatabase = FirebaseDatabase.getInstance("https://familytidy-app-default-rtdb.europe-west1.firebasedatabase.app").getReference();
        sharedPreferences = context.getSharedPreferences("FamilyTidy", Context.MODE_PRIVATE);
        System.out.println("Construct bitti");
    }

    private void addAppUsage(String userID, String childID, ArrayList<Object> stats, ArrayList<Object> allStats) {
        if (stats.isEmpty())
            return;

        String today = LocalDateTime.now().format(dateFormat);
        String year = LocalDateTime.now().format(yearDateFormat);
        mDatabase
                .child("users")
                .child(userID)
                .child("children")
                .child(childID)
                .child("android")
                .child(today)
                .setValue(stats);

        mDatabase
                .child("users")
                .child(userID)
                .child("children")
                .child(childID)
                .child("android")
                .child(year)
                .setValue(allStats);
    }

    @NonNull
    @Override
    public Result doWork() {
        System.out.println("StatsUploadJob UsageStatsManager başlatıldı");

        String userID = sharedPreferences.getString("userID", "");
        String childID = sharedPreferences.getString("childID", "");

        try {
            UsageStatsManager manager = (UsageStatsManager) getApplicationContext().getSystemService(Context.USAGE_STATS_SERVICE);
            UsageManager.getInstance().initialize(manager, sharedPreferences);

            WritableArray result = UsageManager.getInstance().getTodayStats();
            WritableArray allResult = UsageManager.getInstance().getAllTimeStats();
            ArrayList<Object> stats = result.toArrayList();
            ArrayList<Object> allStats = allResult.toArrayList();
            System.out.println("bu kadar nesne var:" + stats.size());

            // firebase'e gönder
            addAppUsage(userID, childID, stats, allStats);

            return Result.success();
        }
        catch (Exception e) {
            System.out.println("UsageStatsManager hata verdi");

            e.printStackTrace();
            return Result.failure();
        }
    }
}
