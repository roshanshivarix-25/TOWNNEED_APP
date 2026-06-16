import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CustomDatePicker({ visible, onClose, onSelectDate, selectedValue }) {
  const [calendarDate, setCalendarDate] = useState(new Date());

  const handlePrevMonth = () => {
    setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const formatDateString = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let i = 1; i <= lastDate; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const handleDaySelect = (day) => {
    if (day) {
      onSelectDate(formatDateString(day));
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={handlePrevMonth}>
              <Ionicons name="chevron-back" size={24} color="#0F172A" />
            </TouchableOpacity>
            <Text style={styles.calendarMonthTitle}>
              {calendarDate.toLocaleString("default", { month: "long" })} {calendarDate.getFullYear()}
            </Text>
            <TouchableOpacity onPress={handleNextMonth}>
              <Ionicons name="chevron-forward" size={24} color="#0F172A" />
            </TouchableOpacity>
          </View>

          {/* Weekdays Header */}
          <View style={styles.weekdaysRow}>
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => (
              <Text key={day} style={styles.weekdayText}>{day}</Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.daysGrid}>
            {getDaysInMonth(calendarDate).map((day, idx) => {
              if (!day) return <View key={`empty-${idx}`} style={styles.emptyDayBox} />;
              
              const isToday = new Date().toDateString() === day.toDateString();
              const isSelected = selectedValue === formatDateString(day);

              return (
                <TouchableOpacity
                  key={day.toISOString()}
                  style={[
                    styles.dayBox,
                    isToday && styles.dayBoxToday,
                    isSelected && styles.dayBoxSelected
                  ]}
                  onPress={() => handleDaySelect(day)}
                >
                  <Text style={[
                    styles.dayText,
                    isToday && styles.dayTextToday,
                    isSelected && styles.dayTextSelected
                  ]}>
                    {day.getDate()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.closeCalendarBtn}
            onPress={onClose}
          >
            <Text style={styles.closeCalendarBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  calendarContainer: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  calendarMonthTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  weekdaysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  weekdayText: {
    width: "14.2%",
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  emptyDayBox: {
    width: "14.2%",
    height: 40,
  },
  dayBox: {
    width: "14.2%",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginVertical: 2,
  },
  dayBoxToday: {
    borderWidth: 1.5,
    borderColor: "#9A3412",
  },
  dayBoxSelected: {
    backgroundColor: "#9A3412",
  },
  dayText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  dayTextToday: {
    color: "#9A3412",
  },
  dayTextSelected: {
    color: "#FFF",
  },
  closeCalendarBtn: {
    marginTop: 16,
    height: 44,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  closeCalendarBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
  },
});
