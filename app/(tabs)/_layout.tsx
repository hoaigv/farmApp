// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import TabBarIcon from "../../components/TabBarIcon";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
        },
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
              iconSet="Ionicons"
              name="home-outline"
              color={color}
              size={size}
              label="Home"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="garden"
        options={{
          title: "Gardent",
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              iconSet="Entypo"
              name="leaf"
              color={color}
              size={size}
              label="Gardent"
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
              label="Chat AI"
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="forum"
        options={{
          title: "Forum",
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <TabBarIcon
              iconSet="Ionicons"
              name="people-outline"
              color={color}
              size={size}
              label="Forum"
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
