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
import { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { Settings as SettingsIcon, Key, Server, Eye, EyeOff, CheckCircle, Coins, Moon, Sun } from 'lucide-react-native';
import { useExchange } from '@/contexts/ExchangeContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ExchangeConfig } from '@/types/exchanges';

export default function SettingsScreen() {
  const { configs, globalMode, setMode, updateExchangeConfig, cryptoPairs, updateCryptoPairConfig } = useExchange();
  const { theme, mode: themeMode, toggleTheme } = useTheme();
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
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <SettingsIcon size={32} color={theme.tint} strokeWidth={2.5} />
          <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Configure exchanges and API keys</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            {themeMode === 'light' ? (
              <Sun size={20} color={theme.textSecondary} />
            ) : (
              <Moon size={20} color={theme.textSecondary} />
            )}
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>
          </View>
          <View style={[styles.modeContainer, { backgroundColor: theme.surface, shadowColor: theme.cardShadow }]}>
            <View style={styles.modeInfo}>
              <Text style={[styles.modeLabel, { color: theme.text }]}>Light Mode</Text>
              <Text style={[styles.modeDescription, { color: theme.textSecondary }]}>
                Bright theme for daytime
              </Text>
            </View>
            <Switch
              value={themeMode === 'dark'}
              onValueChange={toggleTheme}
              trackColor={{ false: '#F59E0B', true: '#6366F1' }}
              thumbColor="#FFFFFF"
            />
            <View style={styles.modeInfo}>
              <Text style={[styles.modeLabel, { color: theme.text }]}>Dark Mode</Text>
              <Text style={[styles.modeDescription, { color: theme.textSecondary }]}>
                Easy on the eyes at night
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.modeIndicator,
              { 
                backgroundColor: themeMode === 'dark' ? theme.infoLight : theme.warningLight,
                borderColor: themeMode === 'dark' ? theme.infoDark : theme.warningDark,
              },
            ]}
          >
            {themeMode === 'light' ? (
              <Sun size={16} color={theme.warningDark} />
            ) : (
              <Moon size={16} color={theme.infoDark} />
            )}
            <Text
              style={[
                styles.modeIndicatorText,
                { color: themeMode === 'dark' ? theme.infoDark : theme.warningDark },
              ]}
            >
              Currently using {themeMode.toUpperCase()} theme
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Server size={20} color={theme.textSecondary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Environment Mode</Text>
          </View>
          <View style={[styles.modeContainer, { backgroundColor: theme.surface, shadowColor: theme.cardShadow }]}>
            <View style={styles.modeInfo}>
              <Text style={[styles.modeLabel, { color: theme.text }]}>Sandbox Mode</Text>
              <Text style={[styles.modeDescription, { color: theme.textSecondary }]}>
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
              <Text style={[styles.modeLabel, { color: theme.text }]}>Live Mode</Text>
              <Text style={[styles.modeDescription, { color: theme.textSecondary }]}>
                Use production APIs with real data
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.modeIndicator,
              {
                backgroundColor: globalMode === 'live' ? theme.successLight : theme.warningLight,
                borderColor: globalMode === 'live' ? theme.successDark : theme.warningDark,
              },
            ]}
          >
            <CheckCircle
              size={16}
              color={globalMode === 'live' ? theme.successDark : theme.warningDark}
            />
            <Text
              style={[
                styles.modeIndicatorText,
                { color: globalMode === 'live' ? theme.successDark : theme.warningDark },
              ]}
            >
              Currently in {globalMode.toUpperCase()} mode
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Coins size={20} color={theme.textSecondary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Cryptocurrency Pairs</Text>
          </View>
          <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
            Select up to 3 cryptocurrency pairs to monitor. Only the first 3 enabled pairs will be tracked.
          </Text>
          
          <View style={[styles.cryptoPairsContainer, { backgroundColor: theme.surface, shadowColor: theme.cardShadow }]}>
            {cryptoPairs.map((pair) => {
              const enabledCount = cryptoPairs.filter(p => p.enabled).length;
              const canEnable = !pair.enabled && enabledCount < 3;
              const canDisable = pair.enabled;
              
              return (
                <View key={pair.name} style={[styles.cryptoPairRow, { borderBottomColor: theme.borderLight }]}>
                  <View style={styles.cryptoPairInfo}>
                    <Text style={[styles.cryptoPairName, { color: theme.text }]}>{pair.displayName}</Text>
                    <Text style={[styles.cryptoPairSymbol, { color: theme.textSecondary }]}>{pair.symbol}</Text>
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
          
          <View style={[styles.pairLimitInfo, { backgroundColor: theme.infoLight, borderColor: theme.infoDark }]}>
            <Text style={[styles.pairLimitText, { color: theme.infoDark }]}>
              {cryptoPairs.filter(p => p.enabled).length} / 3 pairs enabled
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Key size={20} color={theme.textSecondary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Exchange Configuration</Text>
          </View>
          <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
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
          <Text style={[styles.footerText, { color: theme.textTertiary }]}>
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
  const { theme } = useTheme();
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [apiSecret, setApiSecret] = useState(config.apiSecret);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setApiKey(config.apiKey);
    setApiSecret(config.apiSecret);
  }, [config.apiKey, config.apiSecret]);

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
    <View style={[styles.exchangeCard, { backgroundColor: theme.surface, shadowColor: theme.cardShadow }]}>
      <View style={[styles.exchangeHeader, { borderBottomColor: theme.borderLight }]}>
        <View style={styles.exchangeHeaderLeft}>
          <Text style={[styles.exchangeName, { color: theme.text }]}>{config.displayName}</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: config.enabled ? theme.successLight : theme.surfaceSecondary,
                borderColor: config.enabled ? theme.successDark : theme.border,
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: config.enabled ? theme.successDark : theme.textSecondary },
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
        <Text style={[styles.inputLabel, { color: theme.text }]}>API Key</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
            value={apiKey}
            onChangeText={(text) => {
              setApiKey(text);
              setIsEditing(true);
            }}
            placeholder="Enter API key"
            placeholderTextColor={theme.textTertiary}
            secureTextEntry={!showApiKey}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.eyeButton} onPress={onToggleShowApiKey}>
            {showApiKey ? (
              <EyeOff size={20} color={theme.textSecondary} />
            ) : (
              <Eye size={20} color={theme.textSecondary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: theme.text }]}>API Secret</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
            value={apiSecret}
            onChangeText={(text) => {
              setApiSecret(text);
              setIsEditing(true);
            }}
            placeholder="Enter API secret"
            placeholderTextColor={theme.textTertiary}
            secureTextEntry={!showApiKey}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.eyeButton} onPress={onToggleShowApiKey}>
            {showApiKey ? (
              <EyeOff size={20} color={theme.textSecondary} />
            ) : (
              <Eye size={20} color={theme.textSecondary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {isEditing && (
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
            onPress={handleCancel}
          >
            <Text style={[styles.buttonSecondaryText, { color: theme.text }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.buttonPrimary, { backgroundColor: theme.tint }]} onPress={handleSave}>
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
    marginTop: 12,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
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
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  modeContainer: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
    marginBottom: 2,
  },
  modeDescription: {
    fontSize: 12,
  },
  modeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  modeIndicatorText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  exchangeCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  },
  exchangeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exchangeName: {
    fontSize: 18,
    fontWeight: '700' as const,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
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
  buttonPrimary: {},
  buttonPrimaryText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  buttonSecondary: {
    borderWidth: 1,
  },
  buttonSecondaryText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
  cryptoPairsContainer: {
    borderRadius: 12,
    overflow: 'hidden',
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
  },
  cryptoPairInfo: {
    flex: 1,
  },
  cryptoPairName: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  cryptoPairSymbol: {
    fontSize: 13,
  },
  pairLimitInfo: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  pairLimitText: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600' as const,
  },
});
