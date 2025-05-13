// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import TabBarIcon from "../../components/TabBarIcon";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 75,
          paddingBottom: 10,
          paddingTop: 15,
          borderRadius: 40,
          margin: 10,
          position: "absolute",
          backgroundColor: "white",
          elevation: 10,
          shadowColor: "#000",
          shadowOpacity: 0.05,
          shadowRadius: 10,
          bottom: 20,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              iconSet="AntDesign"
              name="home"
              color={color}
              size={size}
              label="Home"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="diary"
        options={{
          title: "Diary",
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              iconSet="FontAwesome"
              name="book"
              color={color}
              size={size}
              label="Diary"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              iconSet="Ionicons"
              name="chatbubble-ellipses-outline"
              color={color}
              size={size}
              label="Chat"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              iconSet="AntDesign"
              name="calendar"
              color={color}
              size={size}
              label="Calendar"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              iconSet="AntDesign"
              name="user"
              color={color}
              size={size}
              label="Profile"
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}
