import torch
import torch.nn as nn
import torch.nn.functional as F

class HybridCosmoClassifier(nn.Module):
    """
    Topological Deep Learning Hybrid Model for Cosmology.
    Fuses raw CMB image pixels (processed by a CNN) with topological features
    (processed by an MLP) into a unified massive neural network.
    """
    def __init__(self, num_tda_features=12, num_classes=3):
        super().__init__()
        
        # CNN Branch for raw 2D CMB patch (input shape: [batch, 1, H, W])
        self.cnn = nn.Sequential(
            nn.Conv2d(in_channels=1, out_channels=16, kernel_size=3, padding=1),
            nn.BatchNorm2d(16),
            nn.ReLU(),
            nn.MaxPool2d(2),
            
            nn.Conv2d(in_channels=16, out_channels=32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(2),
            
            nn.Conv2d(in_channels=32, out_channels=64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            
            # Adaptive pool makes the CNN agnostic to input image size (e.g., 48x48 or 64x64)
            nn.AdaptiveAvgPool2d((4, 4)), 
            nn.Flatten()
        )
        
        # Output of CNN will be 64 * 4 * 4 = 1024 features
        cnn_out_features = 64 * 4 * 4
        
        # TDA Branch for the 12 extracted features
        self.tda_mlp = nn.Sequential(
            nn.Linear(num_tda_features, 32),
            nn.ReLU(),
            nn.Linear(32, 32),
            nn.ReLU()
        )
        
        # Fusion layer
        self.classifier = nn.Sequential(
            nn.Linear(cnn_out_features + 32, 128),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(128, num_classes)
        )

    def forward(self, patch, tda_features):
        # patch: [B, 1, H, W], tda_features: [B, 12]
        cnn_out = self.cnn(patch)
        tda_out = self.tda_mlp(tda_features)
        
        fused = torch.cat((cnn_out, tda_out), dim=1)
        logits = self.classifier(fused)
        
        return logits
