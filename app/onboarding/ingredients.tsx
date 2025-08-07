import { View, Text, TouchableOpacity, FlatList, Alert, Modal, TextInput } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '~/utils/supabase';
import { Container } from '~/components/Container';

interface Ingredient {
  id: number;
  name: string;
  quantity: number;
  unit: string;
}

const UNITS = [
  'g',
  'kg',
  'mg',
  'ml',
  'l',
  'cup',
  'cups',
  'tbsp',
  'tsp',
  'oz',
  'lb',
  'piece',
  'pieces',
  'whole',
  'clove',
  'cloves',
  'stick',
  'pinch',
  'dash',
  'bunch',
];

export default function OnboardingIngredients() {
  const router = useRouter();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const nameInputRef = useRef<TextInput>(null);
  const quantityInputRef = useRef<TextInput>(null);
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    console.log('Loading ingredients...');
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log('No authenticated user found, clearing ingredients');
        setIngredients([]);
        return;
      }

      const { data, error } = await supabase
        .from('ingredients')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Load ingredients result:', { data, error });
      if (data && !error) {
        setIngredients(data);
      }
    } catch (error) {
      console.error('Error loading ingredients:', error);
      setIngredients([]);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', quantity: '', unit: '' });
    setEditingIngredient(null);
    setLoading(false);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
    setTimeout(() => nameInputRef.current?.focus(), 100);
  };

  const openEditModal = (ingredient: Ingredient) => {
    setFormData({
      name: ingredient.name,
      quantity: ingredient.quantity.toString(),
      unit: ingredient.unit,
    });
    setEditingIngredient(ingredient);
    setModalVisible(true);
    setTimeout(() => nameInputRef.current?.focus(), 100);
  };

  const handleSaveIngredient = async () => {
    if (!formData.name || !formData.quantity || !formData.unit) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const quantity = parseFloat(formData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const ingredientData = {
        name: formData.name.trim(),
        quantity,
        unit: formData.unit.trim(),
        user_id: user.id,
      };

      console.log('Saving ingredient:', ingredientData);

      let result;
      if (editingIngredient) {
        console.log('Updating existing ingredient:', editingIngredient.id);
        result = await supabase
          .from('ingredients')
          .update(ingredientData)
          .eq('id', editingIngredient.id)
          .select();
      } else {
        console.log('Creating new ingredient');
        result = await supabase.from('ingredients').insert(ingredientData).select();
      }

      console.log('Save ingredient result:', result);

      if (result.error) {
        console.error('Supabase error:', result.error);

        // Handle specific error codes
        if (result.error.code === '23505') {
          Alert.alert(
            'Duplicate Ingredient',
            'You already have this ingredient in your inventory. Please use a different name or edit the existing one.',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Keep modal open for user to correct
                },
              },
            ]
          );
          return;
        }

        throw result.error;
      }

      setModalVisible(false);
      resetForm();
      loadIngredients();
    } catch (error) {
      console.error('Failed to save ingredient:', error);
      Alert.alert('Error', 'Failed to save ingredient');
    } finally {
      setLoading(false);
    }
  };

  const handleAddIngredient = () => {
    openAddModal();
  };

  const handleEditIngredient = (ingredient: Ingredient) => {
    openEditModal(ingredient);
  };

  const handleDeleteIngredient = async (ingredientId: number) => {
    console.log('Deleting ingredient:', ingredientId);
    Alert.alert('Delete Ingredient', 'Are you sure you want to delete this ingredient?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          const { error } = await supabase.from('ingredients').delete().eq('id', ingredientId);
          console.log('Delete ingredient result:', { error });
          if (!error) {
            setIngredients(ingredients.filter((ing) => ing.id !== ingredientId));
          } else {
            console.error('Delete error:', error);
          }
        },
      },
    ]);
  };

  const renderIngredientCard = ({ item }: { item: Ingredient }) => (
    <View className="mb-3 rounded-lg bg-white p-4 shadow-sm">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text style={{ fontFamily: 'Nunito_600SemiBold' }} className="text-lg text-earth-800">
            {item.name}
          </Text>
          <Text style={{ fontFamily: 'Nunito_400Regular' }} className="text-earth-600">
            {item.quantity} {item.unit}
          </Text>
        </View>
        <View className="flex-row space-x-2">
          <TouchableOpacity
            onPress={() => handleEditIngredient(item)}
            className="rounded-lg bg-sage-500 px-3 py-1">
            <Text style={{ fontFamily: 'Nunito_500Medium' }} className="text-cream-50">
              Edit
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteIngredient(item.id)}
            className="bg-terracotta-500 rounded-lg px-3 py-1">
            <Text style={{ fontFamily: 'Nunito_500Medium' }} className="text-cream-50">
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <Container>
      <Stack.Screen options={{ title: 'Ingredients', headerShown: false }} />
      <View className="flex-1 bg-cream-50">
        <View className="mb-8 flex-row items-center px-6 pb-4 pt-12">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Text style={{ fontFamily: 'Nunito_600SemiBold' }} className="text-2xl text-earth-600">
              ←
            </Text>
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-2xl text-earth-800">
            Ingredients
          </Text>
        </View>

        <View className="mb-6 px-6">
          <Text style={{ fontFamily: 'Nunito_500Medium' }} className="mb-4 text-lg text-earth-700">
            You must enter at least three ingredients to continue. We assume you already have:
            water, salt, and sugar.
          </Text>
        </View>

        <FlatList
          data={ingredients}
          renderItem={renderIngredientCard}
          keyExtractor={(item) => item.id.toString()}
          className="flex-1 px-6"
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-8">
              <Text style={{ fontFamily: 'Nunito_500Medium' }} className="text-earth-600">
                No ingredients added yet
              </Text>
            </View>
          }
        />

        {/* Ingredient Modal */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => {
            setModalVisible(false);
            resetForm();
          }}>
          <View className="flex-1 justify-center bg-black/50 px-6">
            <View className="rounded-xl bg-white p-6">
              <Text
                style={{ fontFamily: 'Nunito_700Bold' }}
                className="mb-4 text-xl text-earth-800">
                {editingIngredient ? 'Edit Ingredient' : 'Add Ingredient'}
              </Text>

              <View className="mb-4">
                <Text style={{ fontFamily: 'Nunito_500Medium' }} className="mb-2 text-earth-700">
                  Ingredient Name
                </Text>
                <TextInput
                  ref={nameInputRef}
                  className="rounded-lg border border-sage-300 bg-white px-4 py-3 font-sans"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="e.g., flour"
                  autoCapitalize="sentences"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => quantityInputRef.current?.focus()}
                />
              </View>

              <View className="mb-4">
                <Text style={{ fontFamily: 'Nunito_500Medium' }} className="mb-2 text-earth-700">
                  Quantity
                </Text>
                <TextInput
                  ref={quantityInputRef}
                  className="rounded-lg border border-sage-300 bg-white px-4 py-3 font-sans"
                  value={formData.quantity}
                  onChangeText={(text) => setFormData({ ...formData, quantity: text })}
                  placeholder="e.g., 500"
                  keyboardType="numeric"
                  returnKeyType="done"
                  onSubmitEditing={() => quantityInputRef.current?.blur()}
                />
              </View>

              <View className="mb-6">
                <Text style={{ fontFamily: 'Nunito_500Medium' }} className="mb-2 text-earth-700">
                  Unit
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {UNITS.map((unit) => (
                    <TouchableOpacity
                      key={unit}
                      onPress={() => setFormData({ ...formData, unit })}
                      className={`rounded-full border-2 px-3 py-2 ${
                        formData.unit === unit
                          ? 'border-earth-600 bg-earth-600'
                          : 'border-earth-300 bg-cream-50'
                      }`}>
                      <Text
                        style={{ fontFamily: 'Nunito_500Medium' }}
                        className={`${formData.unit === unit ? 'text-cream-50' : 'text-earth-700'}`}>
                        {unit}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View className="flex-row space-x-3">
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                    resetForm();
                  }}
                  className="flex-1 rounded-lg bg-gray-300 py-3">
                  <Text
                    style={{ fontFamily: 'Nunito_600SemiBold' }}
                    className="text-center text-earth-800">
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveIngredient}
                  disabled={loading}
                  className={`flex-1 rounded-lg py-3 ${loading ? 'bg-gray-400' : 'bg-earth-600'}`}>
                  <Text
                    style={{ fontFamily: 'Nunito_600SemiBold' }}
                    className={`text-center ${loading ? 'text-gray-200' : 'text-cream-50'}`}>
                    {loading ? 'Saving...' : 'Save'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <View className="px-6 pb-8">
          <View className="mb-4 flex-row space-x-3">
            <TouchableOpacity
              onPress={handleAddIngredient}
              className="flex-1 rounded-lg bg-sage-600 py-4">
              <Text
                style={{ fontFamily: 'Nunito_600SemiBold' }}
                className="text-center text-lg text-cream-50">
                Enter an ingredient
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/onboarding/utensils')}
              disabled={ingredients.length < 3}
              className={`flex-1 rounded-lg py-4 ${
                ingredients.length >= 3 ? 'bg-earth-600' : 'bg-gray-400'
              }`}>
              <Text
                style={{ fontFamily: 'Nunito_600SemiBold' }}
                className={`text-center text-lg ${ingredients.length >= 3 ? 'text-cream-50' : 'text-gray-200'}`}>
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Container>
  );
}
