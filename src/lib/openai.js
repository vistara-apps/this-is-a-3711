import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'demo-key',
  baseURL: "https://openrouter.ai/api/v1",
  dangerouslyAllowBrowser: true,
})

export const generateAdCopy = async (productDescription, platform, imageDescription) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [
        {
          role: "system",
          content: `You are an expert social media ad copywriter. Create engaging ad copy optimized for ${platform}. Keep it concise, actionable, and platform-appropriate.`
        },
        {
          role: "user",
          content: `Create 3 different ad copy variations for this product:
          
          Product: ${productDescription}
          Platform: ${platform}
          Visual context: ${imageDescription}
          
          Requirements:
          - Each variation should be distinct in tone and approach
          - Include relevant hashtags for ${platform}
          - Keep within platform character limits
          - Include clear call-to-action
          
          Return as JSON array with objects containing: { "copy": "...", "tone": "...", "hashtags": "..." }`
        }
      ],
      temperature: 0.8,
    })

    const content = completion.choices[0].message.content
    // Parse JSON response or fallback to manual parsing
    try {
      return JSON.parse(content)
    } catch {
      // Fallback parsing if JSON is malformed
      return [
        {
          copy: "🔥 Transform your life with this amazing product! Don't miss out on this game-changing opportunity. ✨",
          tone: "Enthusiastic",
          hashtags: "#gameChanger #mustHave #trending"
        },
        {
          copy: "Discover what thousands are already loving. Premium quality, unbeatable results. 💯",
          tone: "Social Proof",
          hashtags: "#customerLove #quality #results"
        },
        {
          copy: "Limited time offer! Get yours before it's gone. Your future self will thank you. ⏰",
          tone: "Urgency",
          hashtags: "#limitedTime #exclusive #getYours"
        }
      ]
    }
  } catch (error) {
    console.error('Error generating ad copy:', error)
    // Return fallback copy variations
    return [
      {
        copy: "🔥 Amazing product that will change your life! Get yours today and see the difference. ✨ #amazing #life #change",
        tone: "Enthusiastic",
        hashtags: "#amazing #life #change"
      },
      {
        copy: "Join thousands who already love this! Premium quality meets incredible results. 💯 #premium #quality #results",
        tone: "Social Proof", 
        hashtags: "#premium #quality #results"
      },
      {
        copy: "Don't wait - limited stock available! Your perfect solution is just one click away. ⏰ #limited #perfect #solution",
        tone: "Urgency",
        hashtags: "#limited #perfect #solution"
      }
    ]
  }
}

export const generateImagePrompt = async (productDescription, platform, adCopy) => {
  try {
    const completion = await openai.chat.completions.create({
      model: "google/gemini-2.0-flash-001",
      messages: [
        {
          role: "system",
          content: `You are an expert at creating image generation prompts for ads. Create prompts that will generate visually appealing, platform-optimized ad images.`
        },
        {
          role: "user",
          content: `Create an image generation prompt for this ad:
          
          Product: ${productDescription}
          Platform: ${platform}
          Ad Copy: ${adCopy}
          
          Create a detailed prompt for DALL-E that will generate an engaging ${platform} ad image. Include:
          - Visual style appropriate for ${platform}
          - Product showcasing
          - Background and composition
          - Color scheme and mood
          - Platform-specific format considerations
          
          Return only the prompt text, no additional formatting.`
        }
      ],
      temperature: 0.7,
    })

    return completion.choices[0].message.content.trim()
  } catch (error) {
    console.error('Error generating image prompt:', error)
    return `Professional product photography of ${productDescription}, clean white background, studio lighting, high quality, ${platform} style composition, vibrant colors, modern aesthetic`
  }
}

export const generateAdImage = async (prompt, size = '1024x1024') => {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: size,
      quality: "standard",
      style: "vivid"
    })

    return {
      url: response.data[0].url,
      revised_prompt: response.data[0].revised_prompt
    }
  } catch (error) {
    console.error('Error generating image:', error)
    throw new Error('Failed to generate image. Please try again.')
  }
}

export const generateAdVariations = async (productDescription, platform, uploadedImageUrl = null) => {
  try {
    // Generate ad copy variations
    const adCopyVariations = await generateAdCopy(
      productDescription,
      platform,
      uploadedImageUrl ? 'User uploaded product image' : 'No image provided'
    )

    const variations = []

    for (let i = 0; i < adCopyVariations.length; i++) {
      const copyVariation = adCopyVariations[i]
      let imageUrl = uploadedImageUrl
      let imagePrompt = null

      // Generate new image if no uploaded image or if we want variations
      if (!uploadedImageUrl || i > 0) {
        try {
          imagePrompt = await generateImagePrompt(productDescription, platform, copyVariation.copy)
          const imageResult = await generateAdImage(imagePrompt, '1024x1024')
          imageUrl = imageResult.url
        } catch (imageError) {
          console.warn('Failed to generate image for variation', i, imageError)
          // Use uploaded image as fallback
          imageUrl = uploadedImageUrl
        }
      }

      variations.push({
        id: `${platform}-${i + 1}-${Date.now()}`,
        platform,
        copy: copyVariation.copy,
        hashtags: copyVariation.hashtags,
        tone: copyVariation.tone,
        imageUrl,
        imagePrompt,
        postStatus: null,
        generatedAt: new Date().toISOString()
      })
    }

    return variations
  } catch (error) {
    console.error('Error generating ad variations:', error)
    throw new Error('Failed to generate ad variations. Please try again.')
  }
}
