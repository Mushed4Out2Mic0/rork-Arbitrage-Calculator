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

export function BalanceCard({ exchange, balances, error, isLoading }: BalanceCardProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, shadowColor: theme.cardShadow }]}>
      <View style={[styles.header, { borderBottomColor: theme.borderLight }]}>
        <View style={styles.headerLeft}>
          <Wallet size={18} color={theme.tint} />
          <Text style={[styles.exchangeName, { color: theme.text }]}>{exchange.toUpperCase()}</Text>
        </View>
        {isLoading && <ActivityIndicator size="small" color={theme.tint} />}
      </View>

      {error ? (
        <View style={[styles.errorBox, { backgroundColor: theme.errorLight }]}>
          <Text style={[styles.errorText, { color: theme.errorDark }]}>{error}</Text>
        </View>
      ) : balances.length === 0 && !isLoading ? (
        <Text style={[styles.emptyText, { color: theme.textTertiary }]}>No balances found or no API keys configured</Text>
      ) : (
        <View style={styles.balanceList}>
          {balances.map((b) => (
            <View key={b.asset} style={[styles.balanceRow, { borderBottomColor: theme.borderLight }]}>
              <View style={[styles.assetBadge, { backgroundColor: theme.surfaceSecondary }]}>
                <Text style={[styles.assetText, { color: theme.text }]}>{b.asset}</Text>
              </View>
              <View style={styles.amountColumn}>
                <Text style={[styles.amountLabel, { color: theme.textTertiary }]}>Available</Text>
                <Text style={[styles.amountValue, { color: theme.text }]}>{b.free.toFixed(6)}</Text>
              </View>
              <View style={styles.amountColumn}>
                <Text style={[styles.amountLabel, { color: theme.textTertiary }]}>Total</Text>
                <Text style={[styles.amountValue, { color: theme.text }]}>{b.total.toFixed(6)}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exchangeName: {
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  errorBox: {
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 12,
  },
  balanceList: {
    gap: 0,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 12,
  },
  assetBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    minWidth: 50,
    alignItems: 'center',
  },
  assetText: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  amountColumn: {
    flex: 1,
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 10,
    fontWeight: '500' as const,
    marginBottom: 2,
  },
  amountValue: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
});
