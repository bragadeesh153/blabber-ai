import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Volume2, MessageSquare, Moon, Palette, Monitor, Play } from 'lucide-react-native';

export default function Settings() {
  const [audioFeedback, setAudioFeedback] = useState(true);
  const [visualEffects, setVisualEffects] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [gentleMode, setGentleMode] = useState(true);
  const [speechRate, setSpeechRate] = useState(0.8);
  const [speechPitch, setSpeechPitch] = useState(1.1);

  const SettingItem = ({ icon: Icon, title, description, value, onValueChange, hasSwitch = true }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <Icon size={24} color="#8b5cf6" strokeWidth={2} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      {hasSwitch && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#374151', true: '#8b5cf6' }}
          thumbColor={value ? '#ffffff' : '#9ca3af'}
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0a0a0b', '#1a1a2e', '#16213e']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Customize your voice speaking experience</Text>
            {Platform.OS === 'web' && (
              <View style={styles.platformBadge}>
                <Monitor size={16} color="#10b981" strokeWidth={2} />
                <Text style={styles.platformText}>Web Optimized</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Speech Settings</Text>
            
            <SettingItem
              icon={MessageSquare}
              title="Text-to-Speech"
              description="High-quality voice synthesis for gentle communication"
              value={true}
              onValueChange={() => {}}
            />
            
            <View style={styles.settingItem}>
              <View style={styles.settingIcon}>
                <Play size={24} color="#8b5cf6" strokeWidth={2} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>Speech Rate</Text>
                <Text style={styles.settingDescription}>
                  Current: {speechRate} (Slower is more calming)
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Feedback</Text>
            
            <SettingItem
              icon={Volume2}
              title="Audio Feedback"
              description="Hear tones when voice starts and stops speaking"
              value={audioFeedback}
              onValueChange={setAudioFeedback}
            />
            
            <SettingItem
              icon={Palette}
              title="Visual Effects"
              description="Voice blob animations and visual feedback while speaking"
              value={visualEffects}
              onValueChange={setVisualEffects}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Appearance</Text>
            
            <SettingItem
              icon={Moon}
              title="Dark Mode"
              description="Easy on the eyes, perfect for any time of day"
              value={darkMode}
              onValueChange={setDarkMode}
            />
            
            <SettingItem
              icon={Palette}
              title="Gentle Mode"
              description="Softer colors and animations for baby-friendly use"
              value={gentleMode}
              onValueChange={setGentleMode}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Voice Features</Text>
            
            <View style={styles.featureCard}>
              <Text style={styles.featureTitle}>🗣️ Text-to-Speech Engine</Text>
              <Text style={styles.featureDescription}>
                Native speech synthesis with adjustable rate and pitch for natural voice output
              </Text>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureTitle}>🎵 Voice Blob Visualization</Text>
              <Text style={styles.featureDescription}>
                Dynamic visual feedback that pulses and vibrates while speaking
              </Text>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureTitle}>✨ Smooth Animations</Text>
              <Text style={styles.featureDescription}>
                Hardware-accelerated animations optimized for web browsers
              </Text>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureTitle}>📱 Responsive Design</Text>
              <Text style={styles.featureDescription}>
                Perfect experience across desktop, tablet, and mobile browsers
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            
            <View style={styles.aboutContainer}>
              <Text style={styles.aboutText}>
                Voice Speaker Interface v1.0
              </Text>
              <Text style={styles.aboutDescription}>
                Designed for gentle, intuitive voice output with visual feedback 
                and calming animations suitable for all family members. Features 
                text-to-speech with voice blob visualizations that vibrate and 
                pulse while speaking. Optimized for web browsers with modern 
                audio and animation capabilities.
              </Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0b',
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 16,
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  platformText: {
    fontSize: 12,
    color: '#10b981',
    marginLeft: 6,
    fontWeight: '500',
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 20,
  },
  aboutContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  aboutText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  aboutDescription: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 22,
  },
});