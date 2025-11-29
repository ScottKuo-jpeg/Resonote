"use client"

import { useState } from "react"
import { useSettingsStore, PromptTemplate } from "@/store/useSettingsStore"
import { GlassContainer } from "@/components/ui/GlassContainer"
import { PremiumButton } from "@/components/ui/PremiumButton"
import {
    Settings as SettingsIcon,
    Sparkles,
    MessageSquare,
    Brain,
    RotateCcw,
    Save,
    Info,
    ChevronDown,
    ChevronUp
} from "lucide-react"

export function Settings() {
    const { settings, updateSummaryPrompt, updateMindmapPrompt, updateChatSystemPrompt, resetToDefaults } = useSettingsStore()
    const [expandedSection, setExpandedSection] = useState<string | null>('summary')
    const [hasChanges, setHasChanges] = useState(false)

    const [localSummary, setLocalSummary] = useState(settings.summaryPrompt)
    const [localMindmap, setLocalMindmap] = useState(settings.mindmapPrompt)
    const [localChat, setLocalChat] = useState(settings.chatSystemPrompt)

    const handleSave = () => {
        updateSummaryPrompt(localSummary)
        updateMindmapPrompt(localMindmap)
        updateChatSystemPrompt(localChat)
        setHasChanges(false)
    }

    const handleReset = () => {
        if (confirm('Are you sure you want to reset all prompts to default values?')) {
            resetToDefaults()
            setLocalSummary(settings.summaryPrompt)
            setLocalMindmap(settings.mindmapPrompt)
            setLocalChat(settings.chatSystemPrompt)
            setHasChanges(false)
        }
    }

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section)
    }

    const availableVariables = [
        { name: '{transcript}', description: 'The full episode transcript' },
        { name: '{podcastName}', description: 'Name of the podcast' },
        { name: '{podcastDescription}', description: 'Description of the podcast' },
        { name: '{episodeName}', description: 'Name of the episode' },
        { name: '{episodeDescription}', description: 'Description of the episode' },
    ]

    return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-[#0a0a0a] via-[#1a0a2e] to-[#0a0a0a] overflow-hidden">
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-8 border-b border-white/5 bg-white/5 backdrop-blur-md z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute inset-0 bg-violet-500/30 blur-xl rounded-full" />
                        <SettingsIcon className="relative w-6 h-6 text-violet-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">AI Settings</h1>
                </div>
                <div className="flex items-center gap-3">
                    {hasChanges && (
                        <span className="text-sm text-violet-400 font-medium">Unsaved changes</span>
                    )}
                    <PremiumButton
                        variant="ghost"
                        onClick={handleReset}
                        className="!py-2"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset to Defaults
                    </PremiumButton>
                    <PremiumButton
                        variant="primary"
                        onClick={handleSave}
                        disabled={!hasChanges}
                        className="!py-2"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                    </PremiumButton>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                <div className="max-w-5xl mx-auto space-y-6">
                    {/* Info Banner */}
                    <GlassContainer intensity="low" className="p-4 border-violet-500/30">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-gray-300">
                                <p className="font-medium text-white mb-1">Customize AI Prompts</p>
                                <p>Configure how the AI analyzes your podcast episodes. Use variables like <code className="px-1.5 py-0.5 bg-violet-500/20 rounded text-violet-300">{'{transcript}'}</code> to dynamically insert content.</p>
                            </div>
                        </div>
                    </GlassContainer>

                    {/* Available Variables */}
                    <GlassContainer intensity="low" className="p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-violet-400" />
                            Available Variables
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {availableVariables.map((variable) => (
                                <div
                                    key={variable.name}
                                    className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/5 hover:border-violet-500/30 transition-colors"
                                >
                                    <code className="px-2 py-1 bg-violet-500/20 rounded text-violet-300 text-sm font-mono flex-shrink-0">
                                        {variable.name}
                                    </code>
                                    <span className="text-sm text-gray-400">{variable.description}</span>
                                </div>
                            ))}
                        </div>
                    </GlassContainer>

                    {/* Summary Prompt */}
                    <PromptSection
                        icon={Brain}
                        title="Summary Prompt"
                        description="Configure how the AI generates episode summaries"
                        isExpanded={expandedSection === 'summary'}
                        onToggle={() => toggleSection('summary')}
                        color="violet"
                    >
                        <PromptEditor
                            prompt={localSummary}
                            onChange={(updated) => {
                                setLocalSummary(updated)
                                setHasChanges(true)
                            }}
                        />
                    </PromptSection>

                    {/* Mindmap Prompt */}
                    <PromptSection
                        icon={Sparkles}
                        title="Mind Map Prompt"
                        description="Configure how the AI generates mind maps"
                        isExpanded={expandedSection === 'mindmap'}
                        onToggle={() => toggleSection('mindmap')}
                        color="fuchsia"
                    >
                        <PromptEditor
                            prompt={localMindmap}
                            onChange={(updated) => {
                                setLocalMindmap(updated)
                                setHasChanges(true)
                            }}
                        />
                    </PromptSection>

                    {/* Chat System Prompt */}
                    <PromptSection
                        icon={MessageSquare}
                        title="Chat System Prompt"
                        description="Configure the AI assistant's behavior in chat"
                        isExpanded={expandedSection === 'chat'}
                        onToggle={() => toggleSection('chat')}
                        color="indigo"
                    >
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    System Prompt
                                </label>
                                <textarea
                                    value={localChat}
                                    onChange={(e) => {
                                        setLocalChat(e.target.value)
                                        setHasChanges(true)
                                    }}
                                    rows={12}
                                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 outline-none font-mono text-sm resize-none"
                                    placeholder="Enter system prompt..."
                                />
                            </div>
                        </div>
                    </PromptSection>
                </div>
            </div>
        </div>
    )
}

interface PromptSectionProps {
    icon: any
    title: string
    description: string
    isExpanded: boolean
    onToggle: () => void
    color: 'violet' | 'fuchsia' | 'indigo'
    children: React.ReactNode
}

function PromptSection({ icon: Icon, title, description, isExpanded, onToggle, color, children }: PromptSectionProps) {
    const colorClasses = {
        violet: 'from-violet-500 to-purple-500',
        fuchsia: 'from-fuchsia-500 to-pink-500',
        indigo: 'from-indigo-500 to-blue-500'
    }

    return (
        <GlassContainer intensity="low" className="overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-lg font-bold text-white">{title}</h3>
                        <p className="text-sm text-gray-400">{description}</p>
                    </div>
                </div>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
            </button>
            {isExpanded && (
                <div className="px-6 pb-6 border-t border-white/5">
                    <div className="pt-6">
                        {children}
                    </div>
                </div>
            )}
        </GlassContainer>
    )
}

interface PromptEditorProps {
    prompt: PromptTemplate
    onChange: (prompt: PromptTemplate) => void
}

function PromptEditor({ prompt, onChange }: PromptEditorProps) {
    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name
                </label>
                <input
                    type="text"
                    value={prompt.name}
                    onChange={(e) => onChange({ ...prompt, name: e.target.value })}
                    className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 outline-none"
                    placeholder="Prompt name..."
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                </label>
                <input
                    type="text"
                    value={prompt.description}
                    onChange={(e) => onChange({ ...prompt, description: e.target.value })}
                    className="w-full px-4 py-2 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 outline-none"
                    placeholder="Prompt description..."
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    System Prompt
                </label>
                <textarea
                    value={prompt.systemPrompt}
                    onChange={(e) => onChange({ ...prompt, systemPrompt: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 outline-none font-mono text-sm resize-none"
                    placeholder="Enter system prompt..."
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    User Prompt Template
                </label>
                <textarea
                    value={prompt.userPrompt}
                    onChange={(e) => onChange({ ...prompt, userPrompt: e.target.value })}
                    rows={12}
                    className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 outline-none font-mono text-sm resize-none"
                    placeholder="Enter user prompt template... Use {transcript}, {podcastName}, etc."
                />
            </div>
        </div>
    )
}
