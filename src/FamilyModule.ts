import { NativeModules } from 'react-native';
const { FamilyModule } = NativeModules;
export interface UsageStats {
    packageName: string;
    firstTimeStamp: number;
    lastTimeStamp: number;
    lastTimeUsed: number;
    totalTimeInForeground: number;
    lastTimeVisible: number;
    totalTimeVisible: number;
    lastTimeForegroundServiceUsed: number;
    totalTimeForegroundServiceUsed: number;
}

export interface Child {
    childID: string,
    name: string;
    birthDate: number;
    age: string;
    activityOwner: boolean;
}

interface FamilyInterface {
    getChildren(): Promise<Child[]>;
    getStats(): Promise<UsageStats[]>;
    addChild(userID: string, childName: string, birthDate: number): Promise<string>;
    updateChild(userID: string, childID: string, childName: string, birthDate: number, activityOwner: boolean): Promise<string>;
    openSettings(): Promise<boolean>;
    setupJob(userID: string, childID: string): Promise<string>;
    cancelJob(): Promise<string>;
}

export default FamilyModule as FamilyInterface;