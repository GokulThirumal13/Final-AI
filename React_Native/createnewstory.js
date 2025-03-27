import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/FontAwesome';
// import Sound from 'react-native-sound';

export default function NewStoryPrompt() {
    const [prompt, setPrompt] = useState('');
    const [story, setStory] = useState('');
    const [audioUrl, setAudioUrl] = useState(null);
    const navigation = useNavigation();
    

    const handleSubmit = async () => {
        if (prompt.trim().length === 0) {  
            Alert.alert('Error', 'Please enter a prompt.');
            return;
        }

        try {
            const response = await fetch('http://192.168.223.244:3000/generate-story', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Generated story:', data.story);
            setStory(data.story);
            setPrompt('');

        }catch (error) {
            console.error('Error generating story:', error);
            Alert.alert('Error', 'Failed to generate story');
        }
    };

    // const playAudio = () => {
    //     if (audioUrl) {
    //         const sound = new Sound(audioUrl, '', (error) => {
    //             if (error) {
    //                 console.error('Failed to load the sound', error);
    //                 return;
    //             }
    //             sound.play();
    //         });
    //     }
    // };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.title}>Enter your Story prompt</Text>
            <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={3}
                value={prompt}
                onChangeText={(text) => setPrompt(text)}
                placeholder='Type your story here..'
            />
            <TouchableOpacity style={styles.micButton} >
                <Icon name="microphone" size={24} color="#2563eb" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Submit Prompt</Text>
            </TouchableOpacity>

            {story !== '' && (
                <View>
                    <Text style={styles.storyTitle}>Generated Story:</Text>
                    <Text style={styles.storyText}>{story}</Text>
                </View>
            )}

            {audioUrl && (
                <TouchableOpacity style={styles.button} onPress={playAudio}>
                    <Text style={styles.buttonText}>Play Audio</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    contentContainer: {
        justifyContent: 'center',
        flexGrow: 1,
    },
    micButton: {
        padding: 10,
    },
    textArea: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        textAlignVertical: 'top',
        marginBottom: 20,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#2563eb',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    storyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
    },
    storyText: {
        fontSize: 16,
        marginVertical: 10,
    },
});
