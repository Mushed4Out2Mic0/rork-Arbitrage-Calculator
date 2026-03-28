import {
  StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Switch, Alert,
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

  return (
    <>
      <Stack.Screen options={{ title: 'Settings' }} />
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <SettingsIcon size={28} color={theme.tint} strokeWidth={2.5} />
          <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Configure exchanges and preferences</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            {themeMode === 'light' ? <Sun size={18} color={theme.textSecondary} /> : <Moon size={18} color={theme.textSecondary} />}
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Appearance</Text>
          </View>
          <View style={[styles.toggleCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.toggleInfo}><Text style={[styles.toggleLabel, { color: theme.text }]}>Light</Text></View>
            <Switch value={themeMode === 'dark'} onValueChange={toggleTheme} trackColor={{ false: theme.warning, true: theme.tint }} thumbColor="#FFFFFF" />
            <View style={styles.toggleInfo}><Text style={[styles.toggleLabel, { color: theme.text }]}>Dark</Text></View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Server size={18} color={theme.textSecondary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Environment</Text>
          </View>
          <View style={[styles.toggleCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.toggleInfo}>
              <Text style={[styles.toggleLabel, { color: theme.text }]}>Sandbox</Text>
              <Text style={[styles.toggleDesc, { color: theme.textTertiary }]}>Test APIs</Text>
            </View>
            <Switch value={globalMode === 'live'} onValueChange={(v) => setMode(v ? 'live' : 'sandbox')} trackColor={{ false: theme.warning, true: theme.success }} thumbColor="#FFFFFF" />
            <View style={styles.toggleInfo}>
              <Text style={[styles.toggleLabel, { color: theme.text }]}>Live</Text>
              <Text style={[styles.toggleDesc, { color: theme.textTertiary }]}>Real data</Text>
            </View>
          </View>
          <View style={[styles.indicator, { backgroundColor: globalMode === 'live' ? theme.successLight : theme.warningLight, borderColor: globalMode === 'live' ? theme.success : theme.warning }]}>
            <CheckCircle size={14} color={globalMode === 'live' ? theme.successDark : theme.warningDark} />
            <Text style={[styles.indicatorText, { color: globalMode === 'live' ? theme.successDark : theme.warningDark }]}>
              {globalMode.toUpperCase()} mode
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Coins size={18} color={theme.textSecondary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Crypto Pairs</Text>
          </View>
          <Text style={[styles.sectionDesc, { color: theme.textSecondary }]}>Enable up to 3 pairs to monitor.</Text>

          <View style={[styles.pairsCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {cryptoPairs.map((pair) => {
              const enabledCount = cryptoPairs.filter((p) => p.enabled).length;
              const canEnable = !pair.enabled && enabledCount < 3;
              return (
                <View key={pair.name} style={[styles.pairRow, { borderBottomColor: theme.borderLight }]}>
                  <View style={styles.pairInfo}>
                    <Text style={[styles.pairName, { color: theme.text }]}>{pair.displayName}</Text>
                    <Text style={[styles.pairSymbol, { color: theme.textSecondary }]}>{pair.symbol}</Text>
                  </View>
                  <Switch
                    value={pair.enabled}
                    onValueChange={(v) => {
                      if (v && !canEnable) { Alert.alert('Limit Reached', 'Max 3 pairs.'); return; }
                      void updateCryptoPairConfig(pair.name, v);
                    }}
                    trackColor={{ false: theme.border, true: theme.success }}
                    thumbColor="#FFFFFF"
                    disabled={!canEnable && !pair.enabled}
                  />
                </View>
              );
            })}
          </View>
          <View style={[styles.indicator, { backgroundColor: theme.infoLight, borderColor: theme.info }]}>
            <Text style={[styles.indicatorText, { color: theme.infoDark }]}>
              {cryptoPairs.filter((p) => p.enabled).length} / 3 pairs enabled
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Key size={18} color={theme.textSecondary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Exchange API Keys</Text>
          </View>
          <Text style={[styles.sectionDesc, { color: theme.textSecondary }]}>Keys are stored securely on your device.</Text>

          {configs.map((config) => (
            <ExchangeConfigCard
              key={config.name}
              config={config}
              showApiKey={showApiKeys[config.name] || false}
              onToggleShow={() => setShowApiKeys((p) => ({ ...p, [config.name]: !p[config.name] }))}
              onUpdate={async (name, updates) => { await updateExchangeConfig(name, updates); Alert.alert('Saved', `${name} updated`); }}
            />
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textTertiary }]}>API keys are encrypted and stored locally</Text>
        </View>
      </ScrollView>
    </>
  );
}

interface CardProps {
  config: ExchangeConfig;
  showApiKey: boolean;
  onToggleShow: () => void;
  onUpdate: (name: string, updates: Partial<ExchangeConfig>) => void;
}

function ExchangeConfigCard({ config, showApiKey, onToggleShow, onUpdate }: CardProps) {
  const { theme } = useTheme();
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [apiSecret, setApiSecret] = useState(config.apiSecret);
  const [editing, setEditing] = useState(false);

  useEffect(() => { setApiKey(config.apiKey); setApiSecret(config.apiSecret); }, [config.apiKey, config.apiSecret]);

  const save = () => { onUpdate(config.name, { apiKey, apiSecret }); setEditing(false); };
  const cancel = () => { setApiKey(config.apiKey); setApiSecret(config.apiSecret); setEditing(false); };

  return (
    <View style={[styles.exCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={[styles.exHeader, { borderBottomColor: theme.borderLight }]}>
        <View style={styles.exHeaderLeft}>
          <Text style={[styles.exName, { color: theme.text }]}>{config.displayName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: config.enabled ? theme.successLight : theme.surfaceSecondary, borderColor: config.enabled ? theme.success : theme.border }]}>
            <Text style={[styles.statusText, { color: config.enabled ? theme.successDark : theme.textSecondary }]}>
              {config.enabled ? 'ON' : 'OFF'}
            </Text>
          </View>
        </View>
        <Switch value={config.enabled} onValueChange={(v) => onUpdate(config.name, { enabled: v })} trackColor={{ false: theme.border, true: theme.success }} thumbColor="#FFFFFF" />
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: theme.text }]}>API Key</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
            value={apiKey}
            onChangeText={(t) => { setApiKey(t); setEditing(true); }}
            placeholder="Enter API key"
            placeholderTextColor={theme.textTertiary}
            secureTextEntry={!showApiKey}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity style={styles.eyeBtn} onPress={onToggleShow}>
            {showApiKey ? <EyeOff size={18} color={theme.textSecondary} /> : <Eye size={18} color={theme.textSecondary} />}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: theme.text }]}>API Secret</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
            value={apiSecret}
            onChangeText={(t) => { setApiSecret(t); setEditing(true); }}
            placeholder="Enter API secret"
            placeholderTextColor={theme.textTertiary}
            secureTextEntry={!showApiKey}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {editing && (
        <View style={styles.btnRow}>
          <TouchableOpacity style={[styles.btn, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border, borderWidth: 1 }]} onPress={cancel}>
            <Text style={[styles.btnSecText, { color: theme.text }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, { backgroundColor: theme.tint }]} onPress={save}>
            <Text style={styles.btnPrimText}>Save</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  header: { alignItems: 'center', marginBottom: 24, paddingTop: 4 },
  title: { fontSize: 24, fontWeight: '700' as const, marginTop: 8, marginBottom: 2 },
  subtitle: { fontSize: 13, textAlign: 'center' },
  section: { marginBottom: 22 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700' as const },
  sectionDesc: { fontSize: 13, marginBottom: 12, lineHeight: 19 },
  toggleCard: { borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, borderWidth: 1 },
  toggleInfo: { flex: 1 },
  toggleLabel: { fontSize: 13, fontWeight: '600' as const, marginBottom: 1 },
  toggleDesc: { fontSize: 10 },
  indicator: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, borderRadius: 8, borderWidth: 1 },
  indicatorText: { fontSize: 12, fontWeight: '600' as const },
  pairsCard: { borderRadius: 12, overflow: 'hidden', borderWidth: 1 },
  pairRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1 },
  pairInfo: { flex: 1 },
  pairName: { fontSize: 14, fontWeight: '600' as const, marginBottom: 1 },
  pairSymbol: { fontSize: 12 },
  exCard: { borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1 },
  exHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 10, borderBottomWidth: 1 },
  exHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  exName: { fontSize: 16, fontWeight: '700' as const },
  statusBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5, borderWidth: 1 },
  statusText: { fontSize: 9, fontWeight: '700' as const, letterSpacing: 0.5 },
  inputGroup: { marginBottom: 14 },
  inputLabel: { fontSize: 13, fontWeight: '600' as const, marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', position: 'relative' },
  input: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 10, fontSize: 13 },
  eyeBtn: { position: 'absolute', right: 10, padding: 4 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  btn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  btnPrimText: { fontSize: 13, fontWeight: '600' as const, color: '#FFF' },
  btnSecText: { fontSize: 13, fontWeight: '600' as const },
  footer: { paddingVertical: 20, alignItems: 'center' },
  footerText: { fontSize: 11, textAlign: 'center' },
});
