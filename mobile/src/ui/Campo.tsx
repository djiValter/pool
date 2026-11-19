import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { cores, s } from "./tema";

export function Campo({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={local.campo}>
      <Text style={s.rotulo}>{label}</Text>
      <TextInput accessibilityLabel={label} placeholderTextColor={cores.secundario} style={local.input} {...props} />
    </View>
  );
}

const local = StyleSheet.create({
  campo: { gap: 5 },
  input: { color: cores.escuro, backgroundColor: "#fbfdfc", borderRadius: 11, borderWidth: 1, borderColor: cores.linha, padding: 11, minHeight: 46, fontSize: 16 },
});
