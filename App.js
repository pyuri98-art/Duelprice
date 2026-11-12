import React, { useMemo, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, TextInput, View, FlatList, Pressable, Keyboard } from 'react-native';
import { cards } from './data/cards';

const euro = (amount) => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount);

export default function App() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('it');
    if (!term) return cards;
    return cards.filter(card => [card.name, card.italianName, card.set, card.code, card.rarity].some(value => value.toLocaleLowerCase('it').includes(term)));
  }, [query]);

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.brand}>⚡ DuelPrice</Text>
        <Text style={styles.subtitle}>Trova le tue carte Yu-Gi-Oh!</Text>
        <View style={styles.notice}><Text style={styles.noticeText}>VERSIONE DEMO · Prezzi illustrativi, non reali</Text></View>
        <TextInput
          accessibilityLabel="Cerca carte"
          style={styles.search}
          value={query}
          onChangeText={setQuery}
          placeholder="Cerca nome, set, codice o rarità..."
          placeholderTextColor="#8793AA"
          autoCorrect={false}
          returnKeyType="search"
        />
        <Text style={styles.count}>{filtered.length} {filtered.length === 1 ? 'carta trovata' : 'carte trovate'}</Text>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<Text style={styles.empty}>Nessuna carta trovata. Prova un altro termine.</Text>}
        renderItem={({ item }) => (
          <Pressable accessibilityRole="button" accessibilityLabel={`Dettagli ${item.name}`} onPress={() => { Keyboard.dismiss(); setSelected(selected === item.id ? null : item.id); }} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.italianName}>{item.italianName}</Text>
                <Text style={styles.metadata}>{item.code} · {item.rarity}</Text>
              </View>
              <Text style={styles.price}>{euro(item.price)}</Text>
            </View>
            {selected === item.id && <View style={styles.details}>
              <Text style={styles.detailText}>Set: {item.set}</Text>
              <Text style={styles.detailText}>Tipo: {item.type}</Text>
              <Text style={styles.detailText}>Attributo: {item.attribute}</Text>
              <Text style={styles.demoLabel}>Prezzo dimostrativo · Nessun negozio collegato</Text>
            </View>}
            <Text style={styles.expand}>{selected === item.id ? 'Nascondi dettagli ▲' : 'Mostra dettagli ▼'}</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0B1020', paddingTop: 24 },
  header: { paddingHorizontal: 20, paddingTop: 16 },
  brand: { color: '#F7C948', fontSize: 30, fontWeight: '900' },
  subtitle: { color: '#C4CDE0', marginTop: 6, fontSize: 15 },
  notice: { backgroundColor: '#27314B', borderRadius: 9, padding: 10, marginTop: 18 },
  noticeText: { color: '#F7D98B', fontSize: 11, fontWeight: '700', textAlign: 'center' },
  search: { backgroundColor: '#1B2540', color: '#FFFFFF', borderWidth: 1, borderColor: '#3A496B', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, marginTop: 18, fontSize: 15 },
  count: { color: '#AAB8D0', marginTop: 14, marginBottom: 10 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { backgroundColor: '#17223B', padding: 16, borderRadius: 14, marginTop: 12, borderWidth: 1, borderColor: '#2D3A57' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  cardInfo: { flex: 1 },
  cardName: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  italianName: { color: '#B9C7DD', fontSize: 13, marginTop: 4 },
  metadata: { color: '#899BB8', fontSize: 12, marginTop: 8 },
  price: { color: '#F7C948', fontSize: 17, fontWeight: '800' },
  details: { borderTopWidth: 1, borderTopColor: '#35415D', marginTop: 14, paddingTop: 12, gap: 5 },
  detailText: { color: '#D5E0F2', fontSize: 13 },
  demoLabel: { color: '#F7D98B', fontSize: 11, marginTop: 6 },
  expand: { color: '#88B6FF', fontSize: 12, marginTop: 14, fontWeight: '700' },
  empty: { color: '#AAB8D0', textAlign: 'center', marginTop: 36, fontSize: 15 },
});
