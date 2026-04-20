#!/bin/bash
# Download missing images from Squarespace CDN
cd /Users/martinknutli/website-redesigns/pappa-webside/public/images/works/

# Rødt lemurisk landskap
curl -sL "https://images.squarespace-cdn.com/content/v1/5df50f84a345bc32f57e455c/1610897873031-FPK0G2XU2MC5HZ6Z3PXW/DSCF6105+%282%29.JPG?format=2500w" -o rodt-lemurisk-landskap.jpg

# Tattoo
curl -sL "https://images.squarespace-cdn.com/content/v1/5df50f84a345bc32f57e455c/1610895990734-84GYQ1ATG58Y73PFKZAN/IMG_0015+1988.jpg?format=1000w" -o tattoo.jpg

# Trofé
curl -sL "https://images.squarespace-cdn.com/content/v1/5df50f84a345bc32f57e455c/1610896827783-VLYJVEBHEUNB2WA1LO6K/IMG_0033.jpg?format=2500w" -o trofe.jpg

# Trofé (bukk)
curl -sL "https://images.squarespace-cdn.com/content/v1/5df50f84a345bc32f57e455c/1610900385511-M50T00HLZ8RKT7X6NUIF/DSCF6100+%282%29.JPG?format=750w" -o trofe-bukk.jpg

# Cinque Terre series
curl -sL "https://images.squarespace-cdn.com/content/v1/5df50f84a345bc32f57e455c/1610899424932-F540ATG3I00PM4TQE2TK/DSCF6067+%282%29.JPG?format=2500w" -o cinque-terre-1.jpg
curl -sL "https://images.squarespace-cdn.com/content/v1/5df50f84a345bc32f57e455c/1576423430849-E1M9AC9VQNZISJEEBZOY/Cinque+Terre+III.jpg?format=2500w" -o cinque-terre-2.jpg
curl -sL "https://images.squarespace-cdn.com/content/v1/5df50f84a345bc32f57e455c/1611257135328-RY5FECI9U35PSUCT61UK/Trond_Knutli_05.jpg?format=1500w" -o cinque-terre-3.jpg
curl -sL "https://images.squarespace-cdn.com/content/v1/5df50f84a345bc32f57e455c/1576423495796-UU8C98530G5ADAT869QC/Trond_Knutli_06.jpg?format=1500w" -o cinque-terre-4.jpg
curl -sL "https://images.squarespace-cdn.com/content/v1/5df50f84a345bc32f57e455c/1611257362456-HZIPHQZU1YRBGQ3G6UDE/Trond_Knutli_08.jpg?format=1500w" -o cinque-terre-5.jpg
curl -sL "https://images.squarespace-cdn.com/content/v1/5df50f84a345bc32f57e455c/1576427863413-0ZQBRTKSR4DRMSEGG0XB/Trond_Knutli_11.jpg?format=2500w" -o cinque-terre-6.jpg
curl -sL "https://images.squarespace-cdn.com/content/v1/5df50f84a345bc32f57e455c/1576423548119-Y1VNCZ32F7LU68QCKS17/Trond_Knutli_16+%282%29.jpg?format=1500w" -o cinque-terre-7.jpg
curl -sL "https://images.squarespace-cdn.com/content/v1/5df50f84a345bc32f57e455c/1576428733574-G80N6GXZRSOKXNHR7T7I/Carrara+I.png?format=1000w" -o cinque-terre-8.png

echo "Done downloading images"
ls -la rodt-lemurisk-landskap.jpg tattoo.jpg trofe.jpg trofe-bukk.jpg cinque-terre-*.{jpg,png} 2>/dev/null | awk '{print $5, $9}'
