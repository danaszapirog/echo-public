# **Business Requirements Document (BRD)**

## **Project Echo: Social Recommendation App v1.0**

### **1\. Executive Summary**

Project Echo is a mobile social network application designed to solve the problem of unreliable, anonymous online reviews. Users currently struggle to find new places (restaurants, cafes, attractions) they can trust, especially when traveling. The overwhelming volume of generic reviews on platforms like Google Maps and Yelp makes true discovery and reliability difficult.

Our solution is a map-centric platform where users discover places through a curated network of trusted sources: their friends and expert creators (e.g., food bloggers, travel influencers).

The business opportunity lies in creating a high-trust, high-quality discovery network. The initial go-to-market strategy will focus on a Creator-led model, empowering influencers to create and monetize premium, curated "Playlists." This approach solves the "cold start" problem by providing immediate value to new users through pre-loaded, expert content, while creating a direct path to a sustainable, non-intrusive revenue model. This document outlines the scope and requirements for Version 1.0 (MVP) of the platform.

### **2\. Business Objectives**

The primary goals for the Project Echo MVP are to validate the core product thesis and establish an initial user base.

* **Objective 1: Validate the Creator-Led Content Model.** Onboard a minimum of 10 high-quality "Launch Creators" in our target launch city (New York) and have them each publish at least two "Playlists" before launch.  
* **Objective 2: Achieve Early User Adoption and Engagement.** Acquire 1,000 monthly active users within the first 3 months post-launch, with an engagement target of 30% of active users saving at least 5 locations (either as a 'Spot' or 'Want to Go').  
* **Objective 3: Establish a Best-in-Class Personal Utility.** Develop a seamless and intuitive user experience for saving places and creating personal lists ("Playlists"), with the goal of achieving a 4-star or higher rating in the app stores.  
* **Objective 4: Gather Actionable User Feedback.** Implement a simple feedback mechanism within the app to collect qualitative data from early adopters to inform the future product roadmap.

### **3\. Scope for Version 1.0 (MVP)**

To ensure a focused and timely launch, the scope for the MVP is strictly defined below.

#### **In-Scope:**

* **User Account Management:** User registration (Email/Password only), Login, and a simple User Profile (Username, Profile Picture, Bio).  
* **Two User Roles:**  
  * **"Consumer":** Standard user. Can follow others, create and publish Playlists, save locations, and set their profile to public or private.  
  * **"Creator":** A verified, high-value user. Functionally identical to a Consumer for the MVP, but their profile is always public and they are featured in onboarding. This role will have expanded monetization features in future releases.  
* **Map-Centric Interface:** A primary map view where users can see pins for their saved locations and Spots from creators or other users they follow.  
* **User & Creator Discovery:** A basic directory or search function to find and follow launch creators and other consumers.  
* **User & Creator Profiles:** A public view of a creator's profile and a private or public view for consumer profiles, showcasing their published "Playlists."  
* **Content Creation ("Playlists"):** Functionality for all users to create, publish, and manage themed collections of places called "Playlists." These are comprised of a user's **Spots**.  
* **Guided Content Creation:** When creating a Spot, users will be prompted with pre-defined questions to structure their reviews.  
* **Saving Locations:** Functionality for all users to save locations to their personal map as either a **"Spot"** (a place they've been to) or a **"Want to Go"** (a place they want to visit).  
* **Direct User-to-User Following & Social Feed:** A chronological social feed displaying recent activity from followed creators and users. Includes the ability for consumers to request to follow private profiles.

#### **Out-of-Scope (for Future Releases):**

* **Social Sign-In (Google/Apple):** The ability for users to sign up and log in using their Google or Apple accounts. This feature will be added in v1.1 to simplify the registration process.  
* **Google Maps List Import:** The ability for users to import their saved lists from Google Maps. This is a top-priority feature for a fast-follow release (v1.1).  
* **Advanced Social Features:** Commenting, direct messaging, are out-of-scope.  
* **Creator Monetization Engine:** The full payment and subscription system for premium playlists is **out-of-scope for the MVP build** but is the central focus of the business strategy post-launch.  
* **Advanced User Profiles:** No complex social profiles with follower counts, etc.

### **4\. Functional Requirements (User Stories)**

#### **4.1 User Onboarding & Account Management**

* As a new user, I want to sign up for an account using my email and password so that I can access the platform.  
* As a user, I want to log in to my account securely to access my saved places and followed users and creators.  
* As a user, I want to create a simple profile with a username, bio, and profile picture so that others can identify me.  
* As a consumer, I want to set my profile to public or private in my account settings so that I can control who sees my playlists and activity.

#### **4.2 User/Creator Discovery & Content Consumption**

* As a consumer, I want to see a list of featured "Launch Creators" when I first sign up so that I can immediately follow experts and populate my map with content.  
* As a consumer, I want to navigate a map that displays pins for Spots recommended by the creators and users I follow.  
* As a user, I want to search for a specific place by name or address on the map so that I can find it, see existing Spots, or save it for myself.  
* As a consumer, when I tap a pin on the map, I want to see a summary card that shows the place's name, the number of people in my network who have saved it as a Spot, its average rating, and common tags.  
* As a consumer, I want to be able to expand the summary card to open a detailed view of the location.  
* As a consumer, in the detailed view of a location, I want to see a list of all the individual Spots from the creators and friends I follow, including their specific notes and ratings.  
* As a user, I want to visit a creator's or another user's profile page to see all of their published "Playlists."  
* As a user, I want to open a "Playlist" and browse the list of places included.

#### **4.3 Content Creation ("Playlists" & Spots)**

* As a user, I want a simple way to create and manage my "Playlists" from my profile.  
* As a user, I want to start a new "Playlist" by giving it a title, a description, and a cover image.  
* As a user, when adding a location to a playlist as a Spot, I want to be prompted with a pre-defined list of questions (e.g., "What's the vibe?", "What's the one dish to order?") to make my review more structured and helpful.  
* As a user, as part of the prompts when creating a Spot, I want to give the location a star rating (1-5) and add relevant tags so my review is more descriptive.  
* As a user, as part of the prompts when creating a Spot, I want to add custom notes and upload my own photos for each Spot in my playlist.  
* As a user, I want to publish my "Playlist" so that it becomes visible on my profile to my followers (or to the public if I am a creator).  
* As a user, I want to be able to edit or unpublish my playlists after they are live.

#### **4.4 Saving Locations & Personal Utility**

* As a user, when I find a location, I want to save it as either a **"Spot"** or a **"Want to Go"** so I can organize my places.  
* As a user, I want my "Want to Go" locations to be private to my personal map so I can plan future visits.  
* As a user, I want my "Spots" to be available to add to my public-facing Playlists.  
* As a user, I want to easily convert a "Want to Go" location into a "Spot" by filling out the guided questions, without having to add it to a playlist first.  
* As a user, I want my "Spots" to be visible on my personal map with a distinct icon, separate from "Want to Go" locations, so I can see all the places I've endorsed.

#### **4.5 Social & Following**

* As a user, I want to search for other users by their username so that I can find and follow them.  
* As a user, I want to instantly follow a public user without needing their approval.  
* As a user, I want to send a follow request to a private user to connect with them on the platform.  
* As a private user, I want to approve or deny follow requests from other users to control who sees my profile and playlists.  
* As a user, I want a chronological social feed where I can see the latest published playlists and Spots from the creators and users I follow.

#### **4.6 Post-MVP Functional Requirements (v1.1)**

* As a new user, I want to import my existing saved places from my Google Maps account so that I can instantly populate my personal map without manual effort.

### **5\. Key User Flows**

#### **5.1 New User Onboarding & First Value**

1. User downloads the app from the App Store and opens it.  
2. User signs up for a new account.  
3. Upon first login, the app displays a "Welcome" screen prompting the user to follow at least 3 featured "Launch Creators."  
4. User selects 3 creators and taps "Done."  
5. User is taken to the main map view, which is now populated with pins from the creators they just followed.  
6. A tooltip guides the user to tap on a pin to see details and save the location.

#### **5.2 Creator Playlist Creation Flow**

1. A user designated as a "Creator" logs into the app.  
2. Creator navigates to their Profile and taps a "Creator Studio" or "+" button.  
3. Creator selects "Create New Playlist."  
4. Creator enters the Playlist's title ("My Top 5 Pizza Spots"), description, and uploads a cover photo.  
5. On the "Add Locations" screen, the creator uses a search bar to find "Joe's Pizza."  
6. Creator selects the correct location and is prompted to create a Spot. They answer guided questions, add a rating, tags, notes, and a photo.  
7. Creator repeats this process for four more pizza places.  
8. Once the playlist is complete, the creator taps "Publish." The playlist is now live on their public profile.

#### **5.3 Following Another User**

1. User taps on the "Search" tab from the main navigation.  
2. User types another user's username into the search bar.  
3. User sees the user's profile in the search results and taps on it.  
4. On the user's profile, the user taps the "Follow" button.  
5. **If the user's profile is public:** The user instantly starts following them. Their content will now appear in the feed and map.  
6. **If the user's profile is private:** A request is sent to the user. Once they approve the request, their content will appear in the feed and map.

#### **5.4 Consumer Playlist Creation Flow**

1. A consumer navigates to their own profile page.  
2. User taps the "Create a new Playlist" button.  
3. User enters a title for the Playlist (e.g., "Favorite Local Coffee Shops").  
4. User taps "Add Locations" and selects from a list of places they have previously saved as "Spots."  
5. Once finished, the user taps "Publish." The playlist is now visible on their profile to their followers.

#### **5.5 Saving a Location Flow**

1. A user is browsing the map and taps on a pin for a location they don't have saved.  
2. In the location's detail view, the user taps the "Save" button.  
3. A prompt appears with two options: "Save as Spot" and "Want to Go".  
4. **If user taps "Want to Go":** The location is added to their personal map with a distinct "want to go" icon, visible only to them.  
5. **If user taps "Save as Spot":** They are taken to the guided questions flow to add their rating, notes, and tags. The location is then saved as a Spot, available to be added to playlists.

#### **5.6 Converting "Want to Go" to a "Spot"**

This conversion can be initiated in two primary ways:

**Path A: From the "Want to Go" Pin on the Personal Map**

1. A user is browsing their personal map and taps on one of their saved "Want to Go" locations.  
2. In the location's detail view, the user sees a button like "I've been here\! Save it as a Spot".  
3. User taps the button, which initiates the guided questions flow.  
4. Upon completion, the location's status on their personal map changes from a "Want to Go" to a "Spot", and it is now available to be added to future playlists.

**Path B: From a Direct Search or Discovery**

1. A user finds a location on the map (either through search or general browsing) that they have previously saved as a "Want to Go".  
2. The user taps the main action button (e.g., "Save").  
3. The app recognizes the location is already on the "Want to Go" list and directly initiates the guided questions flow.  
4. Upon completion, the location's status on their personal map is updated from "Want to Go" to "Spot".

#### **5.7 Key User Flow: Google Maps Import (Post-MVP)**

1. User navigates to their Profile/Settings page and selects "Import from Google Maps."  
2. User is prompted to authenticate with their Google account.  
3. After successful authentication, the app displays a list of the user's saved lists (e.g., "Favorites," "Want to Go," "Starred places").  
4. User selects which lists they want to import.  
5. The app processes the import in the background, adding each place to the user's "Want to Go" list by default.  
6. User receives a notification when the import is complete and can see all their imported locations on their personal map.

### **6\. Non-Functional Requirements**

* **Platform:** The application will be developed as a native mobile app for **iOS and Android**.  
* **Performance:**  
  * Map scrolling and zooming must be smooth and responsive, even with several hundred pins displayed.  
  * App screens and content must load in under 3 seconds on a standard 4G connection.  
  * The app should launch from a cold start in under 4 seconds.  
* **Security:**  
  * All user authentication credentials (passwords) must be securely hashed and salted.  
  * Communication between the app and the server must be encrypted via HTTPS.  
  * User location data should only be used when the app is active and with explicit user permission.  
* **Usability:**  
  * The user interface must be clean, modern, and highly intuitive, requiring minimal instruction for a new user.  
  * The app must adhere to Apple's Human Interface Guidelines and Google's Material Design principles.  
  * The primary actions (viewing the map, saving a location, accessing the feed) must be easily accessible.  
* **Data & External Services:**  
  * **Architecture:** The application will utilize third-party services for map visualization and place data to ensure scalability, data accuracy, and a unique user experience.  
    * **Map Visualization Service Requirements:** The chosen service must allow for extensive brand customization of map styles (colors, fonts, pin icons) to create a unique visual identity for the app.  
    * **Place** Data **Service Requirements:** The chosen service must provide a comprehensive and accurate database of consumer-focused points of interest, with rich contextual data (e.g., detailed categories) to support the app's discovery model.  
  * **Data Linkage:** Our internal database will store all user-generated content (reviews, lists, follower relationships, etc.) and link it to a specific location using the external provider's unique and permanent place identifier.  
  * **Essential Data Fields:** To optimize for performance and cost, the app will only fetch and use the following essential data fields from the external API for any given location:  
    * **Unique ID:** The permanent identifier for linking.  
    * **Name:** The human-readable name of the place.  
    * **Geographical Location:** The latitude and longitude coordinates for map pinning.  
    * **Categories:** The detailed categories of the location (e.g., "Taco Place," "Coffee Shop

