export interface QRCodeStatus {
    scanStatus: string;
    loginError?: boolean;
    errorMessage?: string;
    digitalKey?: string;
    userList?: any[];
}

export interface StrongAuthConstants {
    STRONG_AUTH_QR_STATUS_SCANNED: string;
    STRONG_AUTH_QR_STATUS_APPROVED: string;
    STRONG_AUTH_QR_STATUS_UNKNOWN: string;
    STRONG_AUTH_QR_STATUS_ERROR: string;
    STRONG_AUTH_QR_CODE_TIMEOUT: number;
    STRONG_AUTH_STATUS_PING_INTERVAL: number;
}

export const STRONG_AUTH_CONSTANTS: StrongAuthConstants = {
    STRONG_AUTH_QR_STATUS_SCANNED: 'SCANNED',
    STRONG_AUTH_QR_STATUS_APPROVED: 'APPROVED',
    STRONG_AUTH_QR_STATUS_UNKNOWN: 'UNKNOWN',
    STRONG_AUTH_QR_STATUS_ERROR: 'ERROR',
    STRONG_AUTH_QR_CODE_TIMEOUT: 180,
    STRONG_AUTH_STATUS_PING_INTERVAL: 3000,
};

export type QRCodeTimerCallback = () => void;

export class QRCodeTimer {
    private countTimer: number = 0;
    private processTimer: NodeJS.Timeout | null = null;
    private onTimeoutCallback: QRCodeTimerCallback | null = null;
    private onTickCallback: ((timeRemaining: number) => void) | null = null;
    private firstAccessWithStrongAuth: boolean = false;

    /**
     * Initialize timer with timeout value
     */
    public init(timeout: number, hasQRCodeImage: boolean = false): void {
        this.countTimer = timeout;
        this.firstAccessWithStrongAuth = hasQRCodeImage;
    }

    public setOnTimeout(callback: QRCodeTimerCallback): void {
        this.onTimeoutCallback = callback;
    }

    public setOnTick(callback: (timeRemaining: number) => void): void {
        this.onTickCallback = callback;
    }

    public start(): void {
        this.stop();
        this.tick();
    }

    public stop(): void {
        if (this.processTimer) {
            clearTimeout(this.processTimer);
            this.processTimer = null;
        }
    }

    private tick(): void {
        const currentSeconds = this.countTimer;

        if (this.onTickCallback) {
            this.onTickCallback(currentSeconds);
        }

        if (this.countTimer === 0) {
            this.stop();
            if (this.onTimeoutCallback) {
                this.onTimeoutCallback();
            }
            return;
        }

        this.countTimer = this.countTimer - 1;
        this.processTimer = setTimeout(() => this.tick(), 1000);
    }

    public getCounter(): number {
        return this.countTimer;
    }

    public shouldStopPoll(): boolean {
        return this.countTimer <= 0;
    }

    public static formatTime(seconds: number): string {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }
}

export class QRCodePollingManager {
    private pollInterval: NodeJS.Timeout | null = null;
    private isPolling: boolean = false;
    private pollFunction: (() => Promise<QRCodeStatus>) | null = null;
    private onStatusChangeCallback: ((status: QRCodeStatus) => void) | null = null;
    private interval: number = STRONG_AUTH_CONSTANTS.STRONG_AUTH_STATUS_PING_INTERVAL;

    public setPollFunction(pollFunction: () => Promise<QRCodeStatus>): void {
        this.pollFunction = pollFunction;
    }

    public setOnStatusChange(callback: (status: QRCodeStatus) => void): void {
        this.onStatusChangeCallback = callback;
    }

    public setInterval(interval: number): void {
        this.interval = interval;
    }

    public start(): void {
        if (this.isPolling) {
            return;
        }

        this.isPolling = true;
        this.poll();
    }

    public stop(): void {
        this.isPolling = false;
        if (this.pollInterval) {
            clearTimeout(this.pollInterval);
            this.pollInterval = null;
        }
    }

    private async poll(): Promise<void> {
        if (!this.isPolling || !this.pollFunction) {
            return;
        }

        try {
            const status = await this.pollFunction();
            
            if (this.onStatusChangeCallback) {
                this.onStatusChangeCallback(status);
            }

            if (this.isPolling) {
                this.pollInterval = setTimeout(() => this.poll(), this.interval);
            }
        } catch (error) {
            if (this.isPolling) {
                this.pollInterval = setTimeout(() => this.poll(), this.interval);
            }
        }
    }

    public getIsPolling(): boolean {
        return this.isPolling;
    }
}

export const handleQRCodeStatus = (
    status: QRCodeStatus,
    constants: StrongAuthConstants = STRONG_AUTH_CONSTANTS
): {
    isScanned: boolean;
    isApproved: boolean;
    isError: boolean;
    shouldCompleteLogin: boolean;
} => {
    const isScanned = status.scanStatus === constants.STRONG_AUTH_QR_STATUS_SCANNED;
    const isApproved = status.scanStatus === constants.STRONG_AUTH_QR_STATUS_APPROVED;
    const isError = 
        status.scanStatus === constants.STRONG_AUTH_QR_STATUS_UNKNOWN ||
        status.scanStatus === constants.STRONG_AUTH_QR_STATUS_ERROR;

    const shouldCompleteLogin = isApproved && !status.loginError;

    return {
        isScanned,
        isApproved,
        isError,
        shouldCompleteLogin
    };
};

export const generateQRCodeDataURL = async (
    qrCodeData: string,
    size: number = 256
): Promise<string> => {
    return `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" fill="#fff"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="14">QR Code</text></svg>`)}`;
};