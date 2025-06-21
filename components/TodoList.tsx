import React, { useState } from "react";
import { View, Text, FlatList, StyleSheet, Switch } from "react-native";

export interface Todo {
  id: string;
  gardenName: string;
  taskType: string;
  time: string;
  completed: boolean;
}

const initialTodos: Todo[] = [
  {
    id: "1",
    gardenName: "Khu vườn rau sạch",
    taskType: "Tưới nước",
    time: "08:00 - 08:30",
    completed: false,
  },
  {
    id: "2",
    gardenName: "Vườn hoa hồng",
    taskType: "Cắt tỉa",
    time: "09:00 - 09:15",
    completed: false,
  },
  {
    id: "3",
    gardenName: "Vườn cây ăn trái",
    taskType: "Bón phân",
    time: "10:00 - 10:20",
    completed: true,
  },
];

interface TodoListProps {
  // Có thể nhận thêm props nếu cần
}

const TodoList: React.FC<TodoListProps> = () => {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);

  const handleToggleComplete = (id: string) => {
    setTodos((prev) => {
      // Tìm item và toggle completed
      const updated = prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      );
      // Lấy item toggled
      const toggled = updated.find((item) => item.id === id)!;
      // Loại bỏ item cũ khỏi mảng
      const others = updated.filter((item) => item.id !== id);
      // Nếu đã hoàn thành, đưa về sau cùng, ngược lại đưa về đầu
      if (toggled.completed) {
        return [...others, toggled];
      } else {
        return [toggled, ...others];
      }
    });
  };

  const renderItem = ({ item }: { item: Todo }) => (
    <View style={styles.itemContainer}>
      <View style={styles.info}>
        <Text style={styles.text}>
          <Text style={styles.bold}>Khu vườn:</Text> {item.gardenName}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Loại công việc:</Text> {item.taskType}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Thời gian:</Text> {item.time}
        </Text>
      </View>
      <Switch
        value={item.completed}
        onValueChange={() => handleToggleComplete(item.id)}
      />
    </View>
  );

  return (
    <>
      <Text className="mx-4 my-2 " style={{ fontSize: 18, fontWeight: "500" }}>
        Note :
      </Text>
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        className="shadow shadow-slate-300 rounded-lg p-2"
      />
    </>
  );
};

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 16,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  info: {
    flex: 1,
  },
  text: {
    fontSize: 13,
    marginBottom: 4,
  },
  bold: {
    fontWeight: "600",
  },
});

export default TodoList;
