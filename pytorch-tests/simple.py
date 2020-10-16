import random
import torch
import torch.nn as nn
from torch.autograd import Variable
from torchvision import transforms
from torchvision.utils import save_image
from matplotlib import pyplot as plt
# from time import time
# import datetime


def to_img(x):
    x = 0.5 * (x + 1)
    x = x.clamp(0, 1)
    x = x.view(x.size(0), 3, 32, 32)
    return x


img_transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize((0.5, 0.5, 0.5), (0.5, 0.5, 0.5))
])


class Model(nn.Module):
    def __init__(self):
        super(Model, self).__init__()
        self.encoder = nn.Sequential(
            nn.Conv2d(3, 16, 4, stride=2, padding=1),  # bs, 16, 16, 16
            nn.ReLU(True),
            nn.Conv2d(16, 16, 4, stride=2, padding=1),  # bs,16, 8, 8
            nn.ReLU(True),
        )
        self.decoder = nn.Sequential(
            nn.ConvTranspose2d(16, 16, 4, stride=2, padding=1),
            nn.ReLU(True),
            nn.ConvTranspose2d(16, 3, 4, stride=2, padding=1),
            nn.ReLU(True),
        )

    def forward(self, x):
        x = self.encoder(x)
        x = self.decoder(x)
        return x


model = Model()
img = torch.rand(1, 3, 32, 32)
pic = to_img(img.data)
# save_image(pic, './simple_imgs/input.png')
# img = Variable(img)

output = model(img)

pic = to_img(output.data)
save_image(pic, './simple_imgs/output.png')

weights = model.encoder[0].weight.data.cpu().numpy()

plt.imshow(weights[2, ...])


