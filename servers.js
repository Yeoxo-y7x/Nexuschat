'nomserveur': {
    name: 'Nom Affiché',
    icon: 'L',
    owner: false,  // true si c'est toi le proprio
    channels: {
        text: [
            { id: 'id-unique', name: 'nom', topic: 'description', icon: '#', locked: false }
        ],
        voice: [
            { id: 'id-unique', name: 'nom', icon: '🔊', users: 0 }
        ],
        activities: [
            { id: 'id-unique', name: 'nom', icon: '🎮' }
        ]
    }
}
