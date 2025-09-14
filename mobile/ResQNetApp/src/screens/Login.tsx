// src/screens/Login.tsx
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { getAuth, signInWithPhoneNumber, type ConfirmationResult } from '@react-native-firebase/auth';

export default function LoginScreen() {

  const [cc, setCc] = useState('91');                 // editable; can be ''
  const [localPretty, setLocalPretty] = useState(''); // "XXXXX XXXXX" (max 11 incl space)
  const [confirmObj, setConfirmObj] = useState<ConfirmationResult | null>(null);
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const onChangeCc = (txt: string) => {
    // allow delete to '' and up to 3 digits
    setCc(txt.replace(/\D/g, '').slice(0, 3));
  };

  const onChangeLocal = (txt: string) => {
    // keep digits only → cap to 10 → pretty print 5 + space + 5
    const digits = txt.replace(/\D/g, '').slice(0, 10);
    const pretty = digits.replace(/^(\d{0,5})(\d{0,5}).*$/, (_, a, b) => (b ? `${a} ${b}` : a));
    setLocalPretty(pretty);
  };

  const rawLocalDigits = () => localPretty.replace(/\D/g, '');

  const e164 = () => {
    const ccDigits = cc || '91'; // fallback if user cleared it
    return `+${ccDigits}${rawLocalDigits()}`;
  };

  const validE164 = (n: string) => /^\+\d{10,15}$/.test(n);

  

  const sendCode = async () => {
    const number = e164();
    // require exactly 10 local digits (India pattern); tweak if you support other countries
    if (rawLocalDigits().length !== 10) {
      Alert.alert('Invalid number', 'Please enter a 10-digit mobile number.');
      return;
    }
    if (!validE164(number)) {
      Alert.alert('Invalid number', 'Please check the country code and number.');
      return;
    }
    try {
      setSending(true);
      const auth = getAuth();
      const confirmation = await signInWithPhoneNumber(auth, number);
      setConfirmObj(confirmation);
    } catch (e: any) {
      Alert.alert('Failed to send OTP', e?.message ?? String(e));
    } finally {
      setSending(false);
    }
  };

  const verify = async () => {
    if (!confirmObj) return;
    try {
      setVerifying(true);
      await confirmObj.confirm(code.trim());
      // Navigator will take over (PostAuthGate/SOS)
    } catch (e: any) {
      Alert.alert('Verification failed', e?.message ?? String(e));
    } finally {
      setVerifying(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.h1}>Login</Text>

      {!confirmObj ? (
        <>
          <Text style={styles.label}>Mobile</Text>

          {/* Single rounded box (no border). '+' is fixed Text; cc + number are TextInputs */}
          <View style={styles.phoneBox}>
            <Text style={styles.plus}>+</Text>

            <TextInput
              value={cc}
              onChangeText={onChangeCc}
              keyboardType="number-pad"
              placeholder="91"
              style={styles.ccInput}
              maxLength={3}
              selectTextOnFocus
            />

            {/* No visible gap between cc and number */}
            <TextInput
              value={localPretty}
              onChangeText={onChangeLocal}
              keyboardType="phone-pad"
              placeholder=""
              style={styles.numInput}
              maxLength={11} // "XXXXX XXXXX" => 11 including space
              returnKeyType="done"
            />
          </View>

          <Text style={styles.help}>We’ll send a one-time password to your mobile number.</Text>

          <Pressable onPress={sendCode} style={[styles.btn, sending && styles.btnDisabled]} disabled={sending}>
            <Text style={styles.btnText}>{sending ? 'Sending…' : 'Send OTP'}</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={styles.label}>Enter OTP</Text>
          <View style={styles.otpBox}>
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder=""
              keyboardType="number-pad"
              style={styles.otpInput}
              maxLength={6}
              returnKeyType="done"
            />
          </View>

          <Pressable onPress={verify} style={[styles.btn, verifying && styles.btnDisabled]} disabled={verifying}>
            <Text style={styles.btnText}>{verifying ? 'Verifying…' : 'Verify'}</Text>
          </Pressable>

          <Pressable onPress={() => setConfirmObj(null)} style={styles.linkBtn}>
            <Text style={styles.linkText}>Change number</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, paddingTop: 32, backgroundColor: '#fff' },
  h1: { fontSize: 22, fontWeight: '900', marginBottom: 16, color: '#111827', textAlign: 'center' },
  label: { fontWeight: '800', color: '#6B7280', marginBottom: 8 },

  // Single rounded input without border (soft background)
  phoneBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F6F7F9',
    paddingHorizontal: 14,
  },
  plus: { fontWeight: '900', color: '#9CA3AF' },

  ccInput: {
    paddingVertical: 0,
    marginLeft: 2,
    width: 48, // make it easier to edit 1–3 digits
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },

  numInput: {
    flex: 1,
    paddingVertical: 0,
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginLeft: 0, // no visible gap after cc
    letterSpacing: 0.2,
  },

  help: { marginTop: 8, color: '#6B7280' },

  btn: {
    marginTop: 16,
    backgroundColor: '#111827',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '800' },

  otpBox: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F6F7F9',
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  otpInput: { fontSize: 16, fontWeight: '800', color: '#111827' },

  linkBtn: { marginTop: 12, alignSelf: 'center', padding: 8 },
  linkText: { color: '#2563EB', fontWeight: '800' },
});
