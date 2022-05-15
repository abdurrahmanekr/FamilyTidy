package com.familytidy;
import android.app.Activity;
import android.app.usage.UsageStats;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.FirebaseApp;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.GenericTypeIndicator;

import java.time.LocalDate;
import java.time.Year;
import java.time.ZoneId;
import java.util.Calendar;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;

@RequiresApi(api = Build.VERSION_CODES.LOLLIPOP_MR1)
public class FamilyModule extends ReactContextBaseJavaModule {
    private static final int USAGE_ACCESS = 1;
    private static final String E_ACTIVITY_DOES_NOT_EXIST = "E_ACTIVITY_DOES_NOT_EXIST";
    private static final String E_FAILED_USAGE_ACCESS = "E_FAILED_USAGE_ACCESS";
    private static final String JOB_NAME = "Send Usage Stats";

    private final UsageStatsManager manager;
    private final DatabaseReference mDatabase;
    private final SharedPreferences sharedPreferences;
    private Promise mUsageAccessPromise;
    private final ActivityEventListener mActivityEventListener = new BaseActivityEventListener() {

        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent intent) {
            if (mUsageAccessPromise == null)
                return;

            try {
                if (requestCode == USAGE_ACCESS) {
                    mUsageAccessPromise.resolve(true);
                    mUsageAccessPromise = null;
                }
            }
            catch (Exception e) {
                mUsageAccessPromise.reject(E_FAILED_USAGE_ACCESS, e);
            }
        }
    };

    FamilyModule(ReactApplicationContext context) {
        super(context);
        FirebaseApp.initializeApp(context);

        context.addActivityEventListener(mActivityEventListener);
        manager = (UsageStatsManager) context.getSystemService(Context.USAGE_STATS_SERVICE);
        sharedPreferences = context.getSharedPreferences("FamilyTidy", Context.MODE_PRIVATE);
        mDatabase = FirebaseDatabase.getInstance("https://familytidy-app-default-rtdb.europe-west1.firebasedatabase.app").getReference();
    }

    @NonNull
    @Override
    public String getName() {
        return "FamilyModule";
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
    public void getStats(final Promise promise) {
        try {
            UsageManager.getInstance().initialize(manager, sharedPreferences);
            WritableArray result = UsageManager.getInstance().getTodayStats();
            promise.resolve(result);
        }
        catch (Exception e) {
            promise.reject(e);
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
    public void openSettings(Promise promise) {
        Activity currentActivity = getCurrentActivity();
        if (currentActivity == null) {
            promise.reject(E_ACTIVITY_DOES_NOT_EXIST, "Activity doesn't exist");
            return;
        }

        mUsageAccessPromise = promise;

        try {
            final Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);

            currentActivity.startActivityForResult(intent, USAGE_ACCESS);
        }
        catch (Exception e) {
            mUsageAccessPromise.reject(E_FAILED_USAGE_ACCESS, e);
            mUsageAccessPromise = null;
        }
    }

    @ReactMethod
    public void cancelJob(Promise promise) {
        try {
            WorkManager.getInstance(getReactApplicationContext().getApplicationContext())
                    .cancelUniqueWork("Send Usage Stats");
            promise.resolve(JOB_NAME);
        }
        catch (Exception e) {
            System.out.println("Hata oluştu");
            e.printStackTrace();
            promise.reject(e);
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    @ReactMethod
    public void setupJob(String userID, String childID, Promise promise) {
        try {
            UsageManager.getInstance().initialize(manager, sharedPreferences);
            PeriodicWorkRequest job = UsageManager.getInstance().setupJob(userID, childID);
            WorkManager.getInstance(getReactApplicationContext().getApplicationContext()).enqueueUniquePeriodicWork(
                    JOB_NAME,
                    ExistingPeriodicWorkPolicy.REPLACE,
                    job
            );

            promise.resolve(job.getId().toString());
        }
        catch (Exception e) {
            System.out.println("Hata oluştu");
            e.printStackTrace();
            promise.reject(e);
        }
    }

    @ReactMethod
    public void addChild(String userID, String childName, int birthDate, Promise promise) {
        String childID = UUID.randomUUID().toString();
        WritableMap child = Arguments.createMap();
        child.putString("name", childName);
        child.putInt("birthDate", birthDate);
        child.putBoolean("activityOwner", false);

        try {
            mDatabase
                    .child("users")
                    .child(userID)
                    .child("children")
                    .child(childID)
                    .setValue(child.toHashMap());
            promise.resolve(childID);
        }
        catch (Exception e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void updateChild(String userID, String childID, String childName, int birthDate, boolean activityOwner, Promise promise) {
        WritableMap child = Arguments.createMap();
        child.putString("name", childName);
        child.putInt("birthDate", birthDate);
        child.putBoolean("activityOwner", activityOwner);

        try {
            mDatabase
                    .child("users")
                    .child(userID)
                    .child("children")
                    .child(childID)
                    .setValue(child.toHashMap());
            promise.resolve(childID);
        }
        catch (Exception e) {
            promise.reject(e);
        }
    }

    @ReactMethod
    public void getChildren(String userID, Promise promise) {
        // TODO hızlandırılabilir
        mDatabase
                .child("users")
                .child(userID)
                .child("children")
                .get()
                .addOnCompleteListener(new OnCompleteListener<DataSnapshot>() {
                    @Override
                    public void onComplete(@NonNull Task<DataSnapshot> task) {
                        if (!task.isSuccessful()) {
                            promise.reject(task.getException());
                            return;
                        }

                        int year = Calendar.getInstance().get(Calendar.YEAR);
                        WritableArray result = Arguments.createArray();
                        for (DataSnapshot child : task.getResult().getChildren()) {
                            String childID = child.getKey();
                            String name = child.child("name").getValue(String.class);
                            Integer birthDate = child.child("birthDate").getValue(Integer.class);
                            Boolean activityOwner = child.child("activityOwner").getValue(Boolean.class);


                            WritableMap entity = Arguments.createMap();
                            entity.putString("childID", childID);
                            entity.putString("name", name);
                            entity.putDouble("birthDate", birthDate);
                            entity.putString("age", String.valueOf(year - birthDate));
                            entity.putBoolean("activityOwner", activityOwner != null && activityOwner);
                            result.pushMap(entity);
                        }

                        promise.resolve(result);
                    }
                });
    }
}
