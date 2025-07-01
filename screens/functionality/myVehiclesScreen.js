// screens/MyVehiclesScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Text, Button } from "react-native-paper";
import { useTranslation } from "react-i18next";
import {
  getAllVehicles,
  addVehicle,
  deleteVehicle,
} from "../../utils/firestore";
import { Swipeable } from "react-native-gesture-handler";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import BrandLogo from "../../components/BrandLogo";

export default function MyVehiclesScreen({ navigation, route }) {
  const { t } = useTranslation();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadVehicles();
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    if (route.params?.newVehicle) {
      const addNewVehicle = async () => {
        try {
          await addVehicle(route.params.newVehicle);
          await loadVehicles();
          navigation.setParams({ newVehicle: undefined });
        } catch (error) {
          alert(t("common.error.save"));
        }
      };
      addNewVehicle();
    }
  }, [route.params?.newVehicle]);

  const loadVehicles = async () => {
    try {
      const loadedVehicles = await getAllVehicles();
      setVehicles(loadedVehicles);
    } catch (error) {
      console.error("Error loading vehicles:", error);
      alert(t("common.error.load"));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVehicle = (vehicleId) => {
    Alert.alert(
      t("common.delete"),
      t("vehicles.deleteConfirmMessage"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteVehicle(vehicleId);
              loadVehicles();
            } catch (error) {
              console.error("Error deleting vehicle:", error);
              alert(t("common.error.delete"));
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    const renderRightActions = () => {
      return (
        <TouchableOpacity
          style={styles.deleteAction}
          onPress={() => handleDeleteVehicle(item.id)}
        >
          <MaterialCommunityIcons name="trash-can" size={24} color="white" />
        </TouchableOpacity>
      );
    };

    return (
      <Swipeable renderRightActions={renderRightActions}>
        <TouchableOpacity
          style={styles.vehicleItem}
          onPress={() =>
            navigation.navigate("VehicleDetails", { vehicle: item })
          }
        >
          <View style={styles.vehicleContent}>
            <BrandLogo brand={item.make} style={styles.brandLogo} />
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleName}>{item.name}</Text>
              <Text style={styles.vehicleSubtitle}>
                {item.make} {item.model}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          {vehicles.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t("vehicles.empty")}</Text>
            </View>
          ) : (
            <FlatList
              data={vehicles}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
            />
          )}

          <Button
            mode="contained"
            onPress={() => navigation.navigate("AddVehicle")}
            style={styles.addButton}
            labelStyle={styles.buttonLabel}
          >
            {t("vehicles.add")}
          </Button>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  vehicleItem: {
    marginVertical: 5,
    backgroundColor: "#e0e0e0",
    display: "flex",
    borderRadius: 6,
  },
  vehicleText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  vehicleSubtext: {
    fontSize: 14,
    color: "#666",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  addButton: {
    position: "absolute",
    bottom: 16,
    alignSelf: "center",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteAction: {
    backgroundColor: "#f44336",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
  },
  brandLogo: {
    width: "auto",
    minWidth: 70,
    left: 0,
    top: 0,
    marginRight: 0,
    borderRadius: 0,
    borderWidth: 0,
    backgroundColor: "white",
  },
  vehicleContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  vehicleInfo: {
    marginLeft: 16,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  vehicleSubtitle: {
    fontSize: 14,
    color: "#666",
  },
});
