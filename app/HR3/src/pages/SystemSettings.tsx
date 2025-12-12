import { useState, useEffect } from 'react';
import { Save, Settings, Clock, Bell, Shield, Loader2 } from 'lucide-react';
import { settingsAPI } from '../services/api';
import './SystemSettings.css';

export default function SystemSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        systemName: 'HR3 Management System',
        organizationName: 'Educational Institution',
        timezone: 'Asia/Manila (GMT+8)',
        dateFormat: 'MM/DD/YYYY',
        currency: 'PHP (₱)',
        workDaysStart: 'Monday',
        workDaysEnd: 'Friday',
        workHoursStart: '08:00 AM',
        workHoursEnd: '05:00 PM',
        enableNotifications: true,
        emailAlerts: true,
        sessionTimeout: '30',
        passwordExpiry: '90',
        autoBackup: true,
        backupFrequency: 'Daily',
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                const data = await settingsAPI.getAll();
                if (data.settingsObj?.general) {
                    setFormData(prev => ({ ...prev, ...data.settingsObj.general, ...data.settingsObj.attendance, ...data.settingsObj.notifications, ...data.settingsObj.security }));
                }
            } catch (err) {
                console.log('Using default settings');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setSuccess(false);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const settings = [
                { key: 'systemName', value: formData.systemName, category: 'general' },
                { key: 'organizationName', value: formData.organizationName, category: 'general' },
                { key: 'timezone', value: formData.timezone, category: 'general' },
                { key: 'dateFormat', value: formData.dateFormat, category: 'general' },
                { key: 'currency', value: formData.currency, category: 'general' },
                { key: 'workDaysStart', value: formData.workDaysStart, category: 'attendance' },
                { key: 'workDaysEnd', value: formData.workDaysEnd, category: 'attendance' },
                { key: 'workHoursStart', value: formData.workHoursStart, category: 'attendance' },
                { key: 'workHoursEnd', value: formData.workHoursEnd, category: 'attendance' },
                { key: 'enableNotifications', value: formData.enableNotifications, category: 'notifications' },
                { key: 'emailAlerts', value: formData.emailAlerts, category: 'notifications' },
                { key: 'sessionTimeout', value: formData.sessionTimeout, category: 'security' },
                { key: 'passwordExpiry', value: formData.passwordExpiry, category: 'security' },
                { key: 'autoBackup', value: formData.autoBackup, category: 'security' },
                { key: 'backupFrequency', value: formData.backupFrequency, category: 'security' },
            ];
            await settingsAPI.bulkUpdate(settings);
            setSuccess(true);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <Loader2 className="spin" size={40} />
            </div>
        );
    }

    return (
        <div className="page-content">
            <div className="page-header">
                <div>
                    <h1 className="page-title">System Settings</h1>
                    <p className="page-subtitle">Configure system-wide preferences and settings</p>
                </div>
                <button className="primary-btn" onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="spin" size={18} /> : <Save size={18} />}
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
            </div>

            {success && (
                <div style={{ padding: '12px 16px', background: '#dcfce7', color: '#16a34a', borderRadius: '8px', marginBottom: '16px' }}>
                    Settings saved successfully!
                </div>
            )}

            <div className="settings-grid">
                <div className="settings-card">
                    <div className="card-title"><Settings size={18} /><span>General Settings</span></div>
                    <div className="form-group">
                        <label>System Name</label>
                        <input type="text" value={formData.systemName} onChange={(e) => handleChange('systemName', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Organization Name</label>
                        <input type="text" value={formData.organizationName} onChange={(e) => handleChange('organizationName', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Timezone</label>
                        <select value={formData.timezone} onChange={(e) => handleChange('timezone', e.target.value)}>
                            <option>Asia/Manila (GMT+8)</option>
                            <option>Asia/Singapore (GMT+8)</option>
                            <option>Asia/Tokyo (GMT+9)</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Date Format</label>
                        <select value={formData.dateFormat} onChange={(e) => handleChange('dateFormat', e.target.value)}>
                            <option>MM/DD/YYYY</option>
                            <option>DD/MM/YYYY</option>
                            <option>YYYY-MM-DD</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Currency</label>
                        <select value={formData.currency} onChange={(e) => handleChange('currency', e.target.value)}>
                            <option>PHP (₱)</option>
                            <option>USD ($)</option>
                            <option>EUR (€)</option>
                        </select>
                    </div>
                </div>

                <div className="settings-card">
                    <div className="card-title"><Clock size={18} /><span>Work Schedule</span></div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Working Days Start</label>
                            <select value={formData.workDaysStart} onChange={(e) => handleChange('workDaysStart', e.target.value)}>
                                <option>Monday</option>
                                <option>Sunday</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Working Days End</label>
                            <select value={formData.workDaysEnd} onChange={(e) => handleChange('workDaysEnd', e.target.value)}>
                                <option>Friday</option>
                                <option>Saturday</option>
                                <option>Sunday</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Work Hours Start</label>
                            <input type="text" value={formData.workHoursStart} onChange={(e) => handleChange('workHoursStart', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Work Hours End</label>
                            <input type="text" value={formData.workHoursEnd} onChange={(e) => handleChange('workHoursEnd', e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="settings-card">
                    <div className="card-title"><Bell size={18} /><span>Notifications</span></div>
                    <div className="toggle-group">
                        <div className="toggle-info">
                            <span className="toggle-label">Enable Notifications</span>
                            <span className="toggle-desc">System-wide notifications</span>
                        </div>
                        <label className="toggle-switch">
                            <input type="checkbox" checked={formData.enableNotifications} onChange={(e) => handleChange('enableNotifications', e.target.checked)} />
                            <span className="slider"></span>
                        </label>
                    </div>
                    <div className="toggle-group">
                        <div className="toggle-info">
                            <span className="toggle-label">Email Alerts</span>
                            <span className="toggle-desc">Send email notifications</span>
                        </div>
                        <label className="toggle-switch">
                            <input type="checkbox" checked={formData.emailAlerts} onChange={(e) => handleChange('emailAlerts', e.target.checked)} />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>

                <div className="settings-card">
                    <div className="card-title"><Shield size={18} /><span>Security & Backup</span></div>
                    <div className="form-group">
                        <label>Session Timeout (minutes)</label>
                        <input type="text" value={formData.sessionTimeout} onChange={(e) => handleChange('sessionTimeout', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Password Expiry (days)</label>
                        <input type="text" value={formData.passwordExpiry} onChange={(e) => handleChange('passwordExpiry', e.target.value)} />
                    </div>
                    <div className="toggle-group">
                        <div className="toggle-info">
                            <span className="toggle-label">Auto Backup</span>
                            <span className="toggle-desc">Automatic database backup</span>
                        </div>
                        <label className="toggle-switch">
                            <input type="checkbox" checked={formData.autoBackup} onChange={(e) => handleChange('autoBackup', e.target.checked)} />
                            <span className="slider"></span>
                        </label>
                    </div>
                    <div className="form-group">
                        <label>Backup Frequency</label>
                        <select value={formData.backupFrequency} onChange={(e) => handleChange('backupFrequency', e.target.value)}>
                            <option>Daily</option>
                            <option>Weekly</option>
                            <option>Monthly</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}
