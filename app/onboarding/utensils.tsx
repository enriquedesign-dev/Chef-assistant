import { View, Text, TouchableOpacity, FlatList, Alert, Modal, TextInput } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { supabase } from '~/utils/supabase';
import { Container } from '~/components/Container';

interface Utensil {
  id: number;
  name: string;
}

export default function OnboardingUtensils() {
  const router = useRouter();
  const [utensils, setUtensils] = useState<Utensil[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUtensil, setEditingUtensil] = useState<Utensil | null>(null);
  const [formData, setFormData] = useState({
    name: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUtensils();
  }, []);

  const loadUtensils = async () => {
    console.log('Loading utensils...');
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.log('No authenticated user found, clearing utensils');
        setUtensils([]);
        return;
      }

      const { data, error } = await supabase
        .from('utensils')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Load utensils result:', { data, error });
      if (data && !error) {
        setUtensils(data);
      }
    } catch (error) {
      console.error('Error loading utensils:', error);
      setUtensils([]);
    }
  };

  const resetForm = () => {
    setFormData({ name: '' });
    setEditingUtensil(null);
    setLoading(false);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (utensil: Utensil) => {
    setFormData({
      name: utensil.name,
    });
    setEditingUtensil(utensil);
    setModalVisible(true);
  };

  const handleSaveUtensil = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a utensil name');
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

      const utensilData = {
        name: formData.name.trim(),
        user_id: user.id,
      };

      console.log('Saving utensil:', utensilData);

      let result;
      if (editingUtensil) {
        console.log('Updating existing utensil:', editingUtensil.id);
        result = await supabase
          .from('utensils')
          .update(utensilData)
          .eq('id', editingUtensil.id)
          .select();
      } else {
        console.log('Creating new utensil');
        result = await supabase.from('utensils').insert(utensilData).select();
      }

      console.log('Save utensil result:', result);

      if (result.error) {
        console.error('Supabase error:', result.error);
        throw result.error;
      }

      setModalVisible(false);
      resetForm();
      loadUtensils();
    } catch (error) {
      console.error('Failed to save utensil:', error);
      Alert.alert('Error', 'Failed to save utensil');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUtensil = () => {
    openAddModal();
  };

  const handleEditUtensil = (utensil: Utensil) => {
    openEditModal(utensil);
  };

  const handleDeleteUtensil = async (utensilId: number) => {
    console.log('Deleting utensil:', utensilId);
    Alert.alert('Delete Utensil', 'Are you sure you want to delete this utensil?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          const { error } = await supabase.from('utensils').delete().eq('id', utensilId);
          console.log('Delete utensil result:', { error });
          if (!error) {
            setUtensils(utensils.filter((ut) => ut.id !== utensilId));
          } else {
            console.error('Delete error:', error);
          }
        },
      },
    ]);
  };

  const renderUtensilCard = ({ item }: { item: Utensil }) => (
    <View className="mb-3 rounded-lg bg-white p-4 shadow-sm">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text style={{ fontFamily: 'Nunito_600SemiBold' }} className="text-lg text-earth-800">
            {item.name}
          </Text>
        </View>
        <View className="flex-row space-x-2">
          <TouchableOpacity
            onPress={() => handleEditUtensil(item)}
            className="rounded-lg bg-sage-500 px-3 py-1">
            <Text style={{ fontFamily: 'Nunito_500Medium' }} className="text-cream-50">
              Edit
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteUtensil(item.id)}
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
      <Stack.Screen options={{ title: 'Utensils', headerShown: false }} />
      <View className="flex-1 bg-cream-50">
        <View className="mb-8 flex-row items-center px-6 pb-4 pt-12">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Text style={{ fontFamily: 'Nunito_600SemiBold' }} className="text-2xl text-earth-600">
              ←
            </Text>
          </TouchableOpacity>
          <Text style={{ fontFamily: 'Nunito_700Bold' }} className="text-2xl text-earth-800">
            Utensils
          </Text>
        </View>

        <View className="mb-6 px-6">
          <Text style={{ fontFamily: 'Nunito_500Medium' }} className="mb-4 text-lg text-earth-700">
            You must enter at least one utensil to continue. We assume you already have: spoon,
            fork, knife, and plates.
          </Text>
        </View>

        <FlatList
          data={utensils}
          renderItem={renderUtensilCard}
          keyExtractor={(item) => item.id.toString()}
          className="flex-1 px-6"
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-8">
              <Text style={{ fontFamily: 'Nunito_500Medium' }} className="text-earth-600">
                No utensils added yet
              </Text>
            </View>
          }
        />

        {/* Utensil Modal */}
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
                {editingUtensil ? 'Edit Utensil' : 'Add Utensil'}
              </Text>

              <View className="mb-6">
                <Text style={{ fontFamily: 'Nunito_500Medium' }} className="mb-2 text-earth-700">
                  Utensil Name
                </Text>
                <TextInput
                  className="rounded-lg border border-sage-300 bg-white px-4 py-3 font-sans"
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="e.g., spatula, whisk, pot"
                  autoCapitalize="sentences"
                />
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
                  onPress={handleSaveUtensil}
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
              onPress={handleAddUtensil}
              className="flex-1 rounded-lg bg-sage-600 py-4">
              <Text
                style={{ fontFamily: 'Nunito_600SemiBold' }}
                className="text-center text-lg text-cream-50">
                Enter a utensil
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/onboarding/tastes')}
              disabled={utensils.length < 1}
              className={`flex-1 rounded-lg py-4 ${
                utensils.length >= 1 ? 'bg-earth-600' : 'bg-gray-400'
              }`}>
              <Text
                style={{ fontFamily: 'Nunito_600SemiBold' }}
                className={`text-center text-lg ${utensils.length >= 1 ? 'text-cream-50' : 'text-gray-200'}`}>
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Container>
  );
}
