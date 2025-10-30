import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { Stack } from 'expo-router';
import { Settings as SettingsIcon, Key, Server, Eye, EyeOff, CheckCircle, Coins } from 'lucide-react-native';
import { useExchange } from '@/contexts/ExchangeContext';
import { ExchangeConfig } from '@/types/exchanges';

export default function SettingsScreen() {
  const { configs, globalMode, setMode, updateExchangeConfig, cryptoPairs, updateCryptoPairConfig } = useExchange();
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});

  const handleToggleMode = (value: boolean) => {
    const mode = value ? 'live' : 'sandbox';
    setMode(mode);
  };

  const handleUpdateConfig = async (name: string, updates: Partial<ExchangeConfig>) => {
    await updateExchangeConfig(name, updates);
    Alert.alert('Success', `${name} configuration updated`);
  };

  const toggleShowApiKey = (exchangeName: string) => {
    setShowApiKeys((prev) => ({
      ...prev,
      [exchangeName]: !prev[exchangeName],
    }));
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Settings' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <SettingsIcon size={32} color="#3B82F6" strokeWidth={2.5} />
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Configure exchanges and API keys</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Server size={20} color="#6B7280" />
            <Text style={styles.sectionTitle}>Environment Mode</Text>
          </View>
          <View style={styles.modeContainer}>
            <View style={styles.modeInfo}>
              <Text style={styles.modeLabel}>Sandbox Mode</Text>
              <Text style={styles.modeDescription}>
                Use testnet/sandbox APIs for testing
              </Text>
            </View>
            <Switch
              value={globalMode === 'live'}
              onValueChange={handleToggleMode}
              trackColor={{ false: '#F59E0B', true: '#10B981' }}
              thumbColor="#FFFFFF"
            />
            <View style={styles.modeInfo}>
              <Text style={styles.modeLabel}>Live Mode</Text>
              <Text style={styles.modeDescription}>
                Use production APIs with real data
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.modeIndicator,
              globalMode === 'live' ? styles.modeIndicatorLive : styles.modeIndicatorSandbox,
            ]}
          >
            <CheckCircle
              size={16}
              color={globalMode === 'live' ? '#10B981' : '#F59E0B'}
            />
            <Text
              style={[
                styles.modeIndicatorText,
                globalMode === 'live'
                  ? styles.modeIndicatorTextLive
                  : styles.modeIndicatorTextSandbox,
              ]}
            >
              Currently in {globalMode.toUpperCase()} mode
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Coins size={20} color="#6B7280" />
            <Text style={styles.sectionTitle}>Cryptocurrency Pairs</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Select up to 3 cryptocurrency pairs to monitor. Only the first 3 enabled pairs will be tracked.
          </Text>
          
          <View style={styles.cryptoPairsContainer}>
            {cryptoPairs.map((pair) => {
              const enabledCount = cryptoPairs.filter(p => p.enabled).length;
              const canEnable = !pair.enabled && enabledCount < 3;
              const canDisable = pair.enabled;
              
              return (
                <View key={pair.name} style={styles.cryptoPairRow}>
                  <View style={styles.cryptoPairInfo}>
                    <Text style={styles.cryptoPairName}>{pair.displayName}</Text>
                    <Text style={styles.cryptoPairSymbol}>{pair.symbol}</Text>
                  </View>
                  <Switch
                    value={pair.enabled}
                    onValueChange={(value) => {
                      if (value && !canEnable) {
                        Alert.alert('Limit Reached', 'You can only enable up to 3 cryptocurrency pairs at a time.');
                        return;
                      }
                      updateCryptoPairConfig(pair.name, value);
                    }}
                    trackColor={{ false: '#E5E7EB', true: '#10B981' }}
                    thumbColor="#FFFFFF"
                    disabled={!canEnable && !canDisable}
                  />
                </View>
              );
            })}
          </View>
          
          <View style={styles.pairLimitInfo}>
            <Text style={styles.pairLimitText}>
              {cryptoPairs.filter(p => p.enabled).length} / 3 pairs enabled
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Key size={20} color="#6B7280" />
            <Text style={styles.sectionTitle}>Exchange Configuration</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Configure API keys for each exchange. Keys are stored securely on your device.
          </Text>

          {configs.map((config) => (
            <ExchangeConfigCard
              key={config.name}
              config={config}
              showApiKey={showApiKeys[config.name] || false}
              onToggleShowApiKey={() => toggleShowApiKey(config.name)}
              onUpdateConfig={handleUpdateConfig}
            />
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            API keys are encrypted and stored locally on your device
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

interface ExchangeConfigCardProps {
  config: ExchangeConfig;
  showApiKey: boolean;
  onToggleShowApiKey: () => void;
  onUpdateConfig: (name: string, updates: Partial<ExchangeConfig>) => void;
}

function ExchangeConfigCard({
  config,
  showApiKey,
  onToggleShowApiKey,
  onUpdateConfig,
}: ExchangeConfigCardProps) {
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [apiSecret, setApiSecret] = useState(config.apiSecret);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onUpdateConfig(config.name, { apiKey, apiSecret });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setApiKey(config.apiKey);
    setApiSecret(config.apiSecret);
    setIsEditing(false);
  };

  return (
    <View style={styles.exchangeCard}>
      <View style={styles.exchangeHeader}>
        <View style={styles.exchangeHeaderLeft}>
          <Text style={styles.exchangeName}>{config.displayName}</Text>
          <View
            style={[
              styles.statusBadge,
              config.enabled ? styles.statusBadgeEnabled : styles.statusBadgeDisabled,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                config.enabled ? styles.statusTextEnabled : styles.statusTextDisabled,
              ]}
            >
              {config.enabled ? 'ENABLED' : 'DISABLED'}
            </Text>
          </View>
        </View>
        <Switch
          value={config.enabled}
          onValueChange={(value) => onUpdateConfig(config.name, { enabled: value })}
          trackColor={{ false: '#E5E7EB', true: '#10B981' }}
          thumbColor="#FFFFFF"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>API Key</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={apiKey}
            onChangeText={(text) => {
              setApiKey(text);
              setIsEditing(true);
            }}
            placeholder="Enter API key"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showApiKey}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.eyeButton} onPress={onToggleShowApiKey}>
            {showApiKey ? (
              <EyeOff size={20} color="#6B7280" />
            ) : (
              <Eye size={20} color="#6B7280" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>API Secret</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={apiSecret}
            onChangeText={(text) => {
              setApiSecret(text);
              setIsEditing(true);
            }}
            placeholder="Enter API secret"
            placeholderTextColor="#9CA3AF"
            secureTextEntry={!showApiKey}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.eyeButton} onPress={onToggleShowApiKey}>
            {showApiKey ? (
              <EyeOff size={20} color="#6B7280" />
            ) : (
              <Eye size={20} color="#6B7280" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {isEditing && (
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleCancel}
          >
            <Text style={styles.buttonSecondaryText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleSave}>
            <Text style={styles.buttonPrimaryText}>Save</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#111827',
    marginTop: 12,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  modeContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  modeInfo: {
    flex: 1,
  },
  modeLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 2,
  },
  modeDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  modeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  modeIndicatorLive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#10B981',
  },
  modeIndicatorSandbox: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  modeIndicatorText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  modeIndicatorTextLive: {
    color: '#059669',
  },
  modeIndicatorTextSandbox: {
    color: '#D97706',
  },
  exchangeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  exchangeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  exchangeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exchangeName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeEnabled: {
    backgroundColor: '#DCFCE7',
    borderColor: '#10B981',
  },
  statusBadgeDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  statusTextEnabled: {
    color: '#059669',
  },
  statusTextDisabled: {
    color: '#6B7280',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#3B82F6',
  },
  buttonPrimaryText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  buttonSecondary: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  buttonSecondaryText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  cryptoPairsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cryptoPairRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cryptoPairInfo: {
    flex: 1,
  },
  cryptoPairName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#111827',
    marginBottom: 2,
  },
  cryptoPairSymbol: {
    fontSize: 13,
    color: '#6B7280',
  },
  pairLimitInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  pairLimitText: {
    fontSize: 13,
    color: '#1E40AF',
    textAlign: 'center',
    fontWeight: '600' as const,
  },
});
