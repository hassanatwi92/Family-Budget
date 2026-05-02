import { useEffect, useState } from "react";
import { Alert, Linking, Button, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { supabase } from "../../lib/supabase";


const styles = {
  card: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  income: {
    backgroundColor: "#d4edda",
  },
  expense: {
    backgroundColor: "#f8d7da",
  },
  balance: {
    backgroundColor: "#d1ecf1",
  },
  cardText: {
    fontSize: 16,
    fontWeight: "bold" as const,
  },
};
export default function Index() {
  const [date, setDate] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showCalendar, setShowCalendar] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<any>(null);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
const [showTypeDropdown, setShowTypeDropdown] = useState(false);
const [transactions, setTransactions] = useState<any[]>([]);
  const [amount, setAmount] = useState("");
  const [search, setSearch] = useState("");
  const [desc, setDesc] = useState("");
  const [payer, setPayer] = useState("");
  const [payerSuggestions, setPayerSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [incomeTotal, setIncomeTotal] = useState(0);
const [expenseTotal, setExpenseTotal] = useState(0);
const [balance, setBalance] = useState(0);
const [payerSummary, setPayerSummary] = useState<any>({});
const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
const [type, setType] = useState("expense");


const filteredSuggestions = payerSuggestions.filter((name) =>
  name.toLowerCase().includes(payer.toLowerCase())
);

const normalizeName = (name: string) =>
  name.trim().toLowerCase();

const fetchTransactions = async () => {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userData.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    Alert.alert(error.message);
  } else {
    setTransactions(data || []);

    

const uniquePayers = Array.from(
  new Set(
    (data || [])
      .map((item) => normalizeName(item.payer))
      .filter((name) => name && name.trim() !== "")
  )
);

setPayerSuggestions(uniquePayers);

    const filteredData =
  selectedMonth === -1
    ? data
    : data.filter((item) => {
        const d = item.date
          ? new Date(item.date + "T00:00:00")
          : null;

        return (
          d &&
          !isNaN(d.getTime()) &&
          d.getMonth() === selectedMonth &&
          d.getFullYear() === selectedYear
        );
      });

    const income = filteredData
  .filter((item) => item.type === "income")
  .reduce((acc, item) => acc + Number(item.amount), 0);

const expense = filteredData
  .filter((item) => item.type === "expense")
  .reduce((acc, item) => acc + Number(item.amount), 0);

setIncomeTotal(income);
setExpenseTotal(expense);
setBalance(income - expense);
const payerTotals: any = {};

filteredData.forEach((item) => {
  
const name = normalizeName(item.payer || "unknown");
  if (!payerTotals[name]) {
    payerTotals[name] = {
      income: 0,
      expense: 0,
      balance: 0,
    };
  }

  const amount = Number(item.amount);

  if (item.type === "income") {
    payerTotals[name].income += amount;
  } else {
    payerTotals[name].expense += amount;
  }

  payerTotals[name].balance =
    payerTotals[name].income - payerTotals[name].expense;
});

setPayerSummary(payerTotals); }

  
};


useEffect(() => {
  const checkUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);

    if (data.user) {
      fetchTransactions();
    }
  };

  checkUser();
}, [selectedMonth, selectedYear]);

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return Alert.alert(error.message);
    Alert.alert("Account created!");
  };

  const signIn = async () => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return Alert.alert(error.message);

  const { data } = await supabase.auth.getUser();
  setUser(data.user);

  await fetchTransactions(); // 🔥 مهم

  Alert.alert("Logged in!");
};

const addTransaction = async () => {
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    Alert.alert("No user");
    return;
  }

 const { error } = await supabase.from("transactions").insert([
  {
    user_id: userData.user.id,
    payer,
    type,
    amount: Number(amount),
    description: desc,
    date: date || new Date().toISOString().split("T")[0],
  },
]);

  if (error) {
    Alert.alert(error.message);
    return;
  }

  await fetchTransactions();

  Alert.alert("Saved ✔️");

  setAmount("");
  setDesc("");
  setPayer("");
  
};

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (user) {
    return (
          <>

{showCalendar && (
  <Modal transparent animationType="slide">
    <View style={{
      flex: 1,
      justifyContent: "center",
      backgroundColor: "rgba(0,0,0,0.5)"
    }}>
      
      <View style={{
        backgroundColor: "white",
        margin: 20,
        borderRadius: 12,
        padding: 10
      }}>
        
        <Calendar
          onDayPress={(day) => {
            setDate(day.dateString);
            setShowCalendar(false);
          }}
        />

        <Button title="Close" onPress={() => setShowCalendar(false)} />
      </View>

    </View>
  </Modal>
)}
      
<ScrollView
  style={{ flex: 1 }}
  contentContainerStyle={{
    padding: 20,
    paddingTop: 100,
    paddingBottom: 200,
  }}
>
  {/* ================= DASHBOARD ================= */}
  <Text>🏠 Dashboard</Text>

  <Text>Selected Date: {date}</Text>

  <View style={[styles.card, styles.income]}>
    <Text style={styles.cardText}>💰 Income: {incomeTotal}</Text>
  </View>

  <View style={[styles.card, styles.expense]}>
    <Text style={styles.cardText}>💸 Expense: {expenseTotal}</Text>
  </View>

  <View style={[styles.card, styles.balance]}>
    <Text style={styles.cardText}>🟢 Balance: {balance}</Text>
  </View>

  {/* ================= BY PERSON ================= */}
    <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
    👨‍👩‍👧‍👦 By Person:
  </Text>

  {Object.keys(payerSummary).map((name) => (
    <View
      key={name}
      style={{
        padding: 10,
        borderWidth: 1,
        borderRadius: 10,
        marginTop: 5,
        marginBottom: 12,
      }}
    >
      <Text>{name}</Text>
      <Text>💰 Income: {payerSummary[name].income}</Text>
<Text>💸 Expense: {payerSummary[name].expense}</Text>
<Text>🟢 Balance: {payerSummary[name].balance}</Text>
    </View>
  ))}

  {/* ================= MONTH PICKER ================= */}
<View style={{
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  padding: 10,
  borderWidth: 1,
  borderRadius: 10,
  marginVertical: 10
}}>
  <Pressable onPress={() => setSelectedYear(selectedYear - 1)}>
    <Text>⬅️ Previous Year</Text>
  </Pressable>

  <Text style={{ fontWeight: "bold" }}>
    Year: {selectedYear}
  </Text>

  <Pressable onPress={() => setSelectedYear(selectedYear + 1)}>
    <Text>Next Year ➡️</Text>
  </Pressable>

</View>

  <Pressable
  onPress={() => setShowMonthDropdown(!showMonthDropdown)}
  style={{ borderWidth: 1, padding: 12, borderRadius: 8, marginBottom: 12 }}
>
  <Text>
    Search by 📅 {selectedMonth === -1 ? "All Months" : `Month ${selectedMonth + 1}`}
  </Text>
</Pressable>


  {/* ================= SEARCH ================= */}
  <TextInput
    placeholder="🔍 Search..."
    value={search}
    onChangeText={setSearch}
    style={{
      borderWidth: 1,
      marginBottom: 12,
      padding: 8,
      borderRadius: 8,
    }}
  />


{showMonthDropdown && (
  <View style={{ borderWidth: 1, borderRadius: 8, marginBottom: 12 }}>
    {[
      "All Months",
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ].map((label, index) => {
      const value = index === 0 ? -1 : index - 1;

      return (
        <Pressable
          key={label}
          onPress={() => {
            setSelectedMonth(value);
            setShowMonthDropdown(false);
          }}
          style={{ padding: 10 }}
        >
          <Text>{label}</Text>
        </Pressable>
      );
    })}
  </View>
)}
  {/* ================= DATE PICKER ================= */}
<Pressable
  onPress={() => setShowTypeDropdown(!showTypeDropdown)}
  style={{ borderWidth: 1, padding: 12, borderRadius: 8, marginBottom: 12 }}
>
  <Text>
    {type === "expense" ? "💸 Expense" : "💰 Income"}
  </Text>
</Pressable>

{showTypeDropdown && (
  <View style={{ borderWidth: 1, borderRadius: 8, marginBottom: 12 }}>
    
    <Pressable
      onPress={() => {
        setType("expense");
        setShowTypeDropdown(false);
      }}
      style={{ padding: 10 }}
    >
      <Text>💸 Expense</Text>
    </Pressable>

    <Pressable
      onPress={() => {
        setType("income");
        setShowTypeDropdown(false);
      }}
      style={{ padding: 10 }}
    >
      <Text>💰 Income</Text>
    </Pressable>

  </View>
)}



  <Pressable
    onPress={() => setShowCalendar(true)}
    style={{
      borderWidth: 1,
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
    }}
  >
    <Text>📅 {date ? date : "Select Date"}</Text>
  </Pressable>

  {/* ================= ADD TRANSACTION INPUTS ================= */}
  <TextInput
    placeholder="Amount"
    value={amount}
    onChangeText={setAmount}
    keyboardType="numeric"
    style={{ borderWidth: 1, marginBottom: 12 }}
  />

  <TextInput
    placeholder="Description"
    value={desc}
    onChangeText={setDesc}
    style={{ borderWidth: 1, marginBottom: 12 }}
  />

  <TextInput
  placeholder="Payer"
  value={payer}
  onChangeText={(text) => {
    setPayer(text);
    setShowSuggestions(true);
  }}
  style={{ borderWidth: 1, marginBottom: 12
   }}
/>

{showSuggestions && payer.length > 0 && (
  <View style={{ borderWidth: 1, borderRadius: 8 }}>
    {filteredSuggestions.map((name) => (
      <Pressable
        key={name}
        onPress={() => {
          setPayer(name);
          setShowSuggestions(false); // 👈 أهم سطر
        }}
        style={{ padding: 10 }}
      >
        <Text>{name}</Text>
      </Pressable>
    ))}
  </View>
)}



  {/* ================= SAVE BUTTON ================= */}
  <Button title="Save Transaction" onPress={addTransaction} />

  {/* ================= TRANSACTIONS LIST ================= */}
  <Text style={{ marginTop: 20 }}>📄 Transactions:</Text>

{transactions
  .filter((item) => {
    const text = search.toLowerCase();

    const matchesSearch =
      !search.trim() ||
      (item.description ?? "").toLowerCase().includes(text) ||
      (item.payer ?? "").toLowerCase().includes(text);

    const safeDate = item.date
      ? new Date(item.date + "T00:00:00")
      : null;

    const matchesMonth =
      selectedMonth === -1 ||
      (
        safeDate &&
        !isNaN(safeDate.getTime()) &&
        safeDate.getMonth() === selectedMonth &&
        safeDate.getFullYear() === selectedYear
      );

    return matchesSearch && matchesMonth;
  })
  .map((item) => (
    <View
      key={item.id}
      style={{
        marginTop: 10,
        padding: 10,
        borderWidth: 1,
        borderRadius: 10,
      }}
    >
      <Text style={{ fontWeight: "bold", marginBottom: 5 }}>
        {item.payer || "Unknown"}
      </Text>

      <Text>💵 Amount: {item.amount}</Text>
      <Text>📝 {item.description}</Text>
      <Text>
        📅 {new Date(item.date + "T00:00:00").toLocaleDateString()}
      </Text>
    </View>
  ))}

  {/* ================= LOGOUT (IMPORTANT LAST) ================= */}
  <View style={{ marginTop: 30 }}>
    <Button title="Logout" onPress={signOut} />
  </View>
</ScrollView>
          </>

    );
  }

  return (
<ScrollView
  style={{ flex: 1 }}
  contentContainerStyle={{
    padding: 20,
    paddingTop: 100,
    paddingBottom: 200, // 👈 مهم جداً
  }}
>
        <Text>Family Budget Login</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, marginBottom: 12 }}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, marginBottom: 12 }}
      />


      <Button title="Sign Up" onPress={signUp} />
      <Button title="Sign In" onPress={signIn} />
<View style={{ marginTop: 30, alignItems: "center", gap: 6 }}>

  <Text style={{ fontSize: 12, color: "gray" }}>
    © 2026 All Rights Reserved
  </Text>

  <Text style={{ fontSize: 12, color: "gray" }}>
    Designed & Developed by Hassan Atwi
  </Text>

  {/* PHONE */}
  <Pressable onPress={() => Linking.openURL("tel:+96176059770")}>
    <Text style={{ fontSize: 12, color: "#007AFF" }}>
      📞 +961 76 059770
    </Text>
  </Pressable>

</View>
    </ScrollView>
  );
}