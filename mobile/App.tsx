import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

const GREEN = "#A7F36B";

function ActionCard({
  eyebrow,
  title,
  description,
  muted = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  muted?: boolean;
}) {
  return (
    <View style={[styles.actionCard, muted && styles.mutedCard]}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDescription}>{description}</Text>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#101510" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>COC / BATTLE SYSTEMS</Text>
            <Text style={styles.title}>Battle{"\n"}Assistant</Text>
          </View>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>READY</Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>TACTICAL SUPPORT · ANDROID</Text>
          <Text style={styles.heroTitle}>Your battle coach.</Text>
          <Text style={styles.heroCopy}>
            Read the battlefield, understand the threats, and make your next
            move with confidence.
          </Text>
          <View style={styles.captureStatus}>
            <View style={styles.captureIcon}>
              <Text style={styles.captureIconText}>◎</Text>
            </View>
            <View style={styles.captureTextWrap}>
              <Text style={styles.captureTitle}>Screen analysis is off</Text>
              <Text style={styles.captureHint}>
                Screen-capture permission will be added in the next milestone.
              </Text>
            </View>
          </View>
          <View style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>SCREEN ANALYSIS · COMING NEXT</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>MISSION MODULES</Text>
          <Text style={styles.sectionMeta}>PHASE 01</Text>
        </View>

        <ActionCard
          eyebrow="01 / BATTLEFIELD"
          title="Enemy base scan"
          description="Identify visible Town Hall and defensive structures from a captured screen."
        />
        <ActionCard
          eyebrow="02 / STRATEGY"
          title="Attack recommendations"
          description="Get a suggested entry side, funnel plan, and spell reminders."
        />
        <ActionCard
          eyebrow="03 / ARMY"
          title="Army analysis"
          description="Review your selected army or explore a suggested composition."
          muted
        />

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>BUILT FOR THE PLAYER</Text>
          <Text style={styles.footerCopy}>
            Advice only. You stay in control of every in-game action.
          </Text>
          <Text style={styles.version}>COC BATTLE ASSISTANT · 0.1.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#101510" },
  container: { padding: 22, paddingBottom: 40, gap: 22 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingTop: 18 },
  brand: { color: GREEN, fontSize: 10, fontWeight: "800", letterSpacing: 2 },
  title: { color: "#F1F5ED", fontSize: 38, lineHeight: 40, fontWeight: "900", marginTop: 12, letterSpacing: -1.5 },
  statusPill: { flexDirection: "row", alignItems: "center", gap: 7, borderWidth: 1, borderColor: "#344532", borderRadius: 30, paddingHorizontal: 11, paddingVertical: 7, marginTop: 4 },
  statusDot: { width: 7, height: 7, borderRadius: 5, backgroundColor: GREEN },
  statusText: { color: GREEN, fontSize: 9, fontWeight: "800", letterSpacing: 1.2 },
  heroCard: { backgroundColor: "#1B241B", borderColor: "#354832", borderWidth: 1, borderRadius: 22, padding: 19, gap: 13 },
  heroEyebrow: { color: GREEN, fontSize: 9, fontWeight: "800", letterSpacing: 1.6 },
  heroTitle: { color: "#F4F7F0", fontSize: 25, fontWeight: "800", letterSpacing: -0.6 },
  heroCopy: { color: "#B9C4B4", fontSize: 13, lineHeight: 20 },
  captureStatus: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#111811", borderRadius: 14, padding: 13, marginTop: 4 },
  captureIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#293B26", alignItems: "center", justifyContent: "center" },
  captureIconText: { color: GREEN, fontSize: 25, fontWeight: "700" },
  captureTextWrap: { flex: 1, gap: 3 },
  captureTitle: { color: "#F0F4EC", fontSize: 12, fontWeight: "700" },
  captureHint: { color: "#94A18F", fontSize: 10, lineHeight: 15 },
  primaryButton: { borderRadius: 12, backgroundColor: "#34452E", padding: 15, alignItems: "center", borderWidth: 1, borderColor: "#526C43" },
  primaryButtonText: { color: "#D6EBCB", fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 2 },
  sectionTitle: { color: "#E8EEE3", fontSize: 12, fontWeight: "900", letterSpacing: 1.5 },
  sectionMeta: { color: GREEN, fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  actionCard: { backgroundColor: "#1A201A", borderColor: "#303A2D", borderWidth: 1, borderRadius: 16, padding: 16, gap: 7 },
  mutedCard: { opacity: 0.68 },
  eyebrow: { color: GREEN, fontSize: 9, fontWeight: "800", letterSpacing: 1.4 },
  cardTitle: { color: "#F0F4EC", fontSize: 16, fontWeight: "800" },
  cardDescription: { color: "#A8B2A2", fontSize: 12, lineHeight: 18 },
  footer: { borderTopWidth: 1, borderTopColor: "#293329", paddingTop: 18, gap: 7 },
  footerTitle: { color: GREEN, fontSize: 9, fontWeight: "900", letterSpacing: 1.5 },
  footerCopy: { color: "#9DA99A", fontSize: 11, lineHeight: 17 },
  version: { color: "#63705F", fontSize: 9, letterSpacing: 1, marginTop: 8 },
});
