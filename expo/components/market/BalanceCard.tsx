import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Wallet } from 'lucide-react-native';

interface BalanceItem {
  asset: string;
  free: number;
  total: number;
}

interface BalanceCardProps {
  exchange: string;
  balances: BalanceItem[];
  error: string | null;
  isLoading: boolean;
}

export const BalanceCard = React.memo(function BalanceCard({ exchange, balances, error, isLoading }: BalanceCardProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Wallet size={16} color={theme.tint} />
          <Text style={[styles.exName, { color: theme.text }]}>{exchange.toUpperCase()}</Text>
        </View>
        {isLoading && <ActivityIndicator size="small" color={theme.tint} />}
      </View>

      {error ? (
        <View style={[styles.errorBox, { backgroundColor: theme.errorLight }]}>
          <Text style={[styles.errorText, { color: theme.errorDark }]}>{error}</Text>
        </View>
      ) : balances.length === 0 && !isLoading ? (
        <Text style={[styles.empty, { color: theme.textTertiary }]}>No balances found</Text>
      ) : (
        balances.map((b) => (
          <View key={b.asset} style={[styles.balRow, { borderBottomColor: theme.borderLight }]}>
            <View style={[styles.assetTag, { backgroundColor: theme.surfaceSecondary }]}>
              <Text style={[styles.assetText, { color: theme.text }]}>{b.asset}</Text>
            </View>
            <View style={styles.amtCol}>
              <Text style={[styles.amtLabel, { color: theme.textTertiary }]}>Available</Text>
              <Text style={[styles.amtVal, { color: theme.text }]}>{b.free.toFixed(6)}</Text>
            </View>
            <View style={styles.amtCol}>
              <Text style={[styles.amtLabel, { color: theme.textTertiary }]}>Total</Text>
              <Text style={[styles.amtVal, { color: theme.text }]}>{b.total.toFixed(6)}</Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  card: { borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 10, borderBottomWidth: 0 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  exName: { fontSize: 15, fontWeight: '700' as const, letterSpacing: 0.5 },
  errorBox: { padding: 10, borderRadius: 8 },
  errorText: { fontSize: 12, lineHeight: 17 },
  empty: { fontSize: 12, textAlign: 'center', paddingVertical: 10 },
  balRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, gap: 10 },
  assetTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5, minWidth: 45, alignItems: 'center' },
  assetText: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 0.5 },
  amtCol: { flex: 1, alignItems: 'flex-end' },
  amtLabel: { fontSize: 9, fontWeight: '500' as const, marginBottom: 2 },
  amtVal: { fontSize: 13, fontWeight: '600' as const },
});
