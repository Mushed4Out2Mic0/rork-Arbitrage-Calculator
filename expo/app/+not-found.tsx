import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AlertCircle } from "lucide-react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "404" }} />
      <View style={styles.container}>
        <AlertCircle size={64} color="#EF4444" strokeWidth={2} />
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.description}>This screen doesn&apos;t exist.</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to Market</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F9FAFB",
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: "#111827",
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 8,
  },
  link: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#3B82F6",
    borderRadius: 8,
  },
  linkText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
});
