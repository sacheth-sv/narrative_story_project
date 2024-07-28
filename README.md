# Narrative Visualization Project Essay

## Messsaging
In this project I am trying to communicate the effect of enacting stricter policies that can reduce the movement of social populations and enforcing vaccination requirements in an attempt to reduce the likelihood of infections and fatalities due to a pandemic. Throughout the COVID-19 pandemic, different states enacted different degrees of social-distancing policies. As a direct consequence of these policies, the COVID-19 pandemic was either curbed or exacerbated. Therefore, this visualization attempts to understand which states enacted the best or worst policies by analyzing the spread of the pandemic. This information can be used for future pandemics and epidemics to determine what best practices to put in place.

## Narrative Structure
This narrative visualization was designed to use an interactive slide-show experience. There are a total of 3 scenes with data visualization elements present within it. Each of the scenes can be accessed via the menubar at the top. There is also the "Introduction" slide that explains each of the 3 scenes in more detail. The user can interact with each slide by moving the mouse over certain data elements or clicking on certain elements. In slides 1 and 2, hovering over the boxplot produces more details in the form of a tooltip. Clicking on any of the boxplot produces a table containing more detailed information regarding the number of policies that were enforced along with states that were analyzed for a specific boxplot.

In slide 3, hovering over the line produces a tooltip containing the number of infections or fatalities present at the time. No click based interaction is present within slide 3.

## Visual Structure
Each of the scenes contain a few different elements. 
- First there is a title that explains the purpose of that specific scene. 
- Second there is a chart that summarizes the most crucial information such as the number of infections, fatalities, or temporal elements of when specific policies took place. 
- Third, there exists a table that contains some more detailed information vital to getting additional information regarding a specific scene. 
- Fourth, there are some key annotations that exist in each scene to intuitively understand the message behind a specific scene. 
- Finally, there exists explanations at either the top or the bottom of a scence that provides additional details regarding the data science. In scene 1 and scene 2, these data science explanations exist at the bottom while in scene 3, this explanation is at the top. This decision was made to ensure that vital information is shown as soon as a user lands on a page.

To navigate between pages, there exists a menubar at the top of every scene and is consistently placed there. At the top, there also always exists the message behind the entire visualization so that users can tie their learnings from each scene to the broader picture.

To preserve the consistency between each of the scences, the color schemes are kept consistent. Infections are always a green/blue combination while fatalities are always red. Additionally, the structure of scene 1 and 2 are identical to ensure that users can intuitively understand that stricter policies have a combinatorial effect on both curbing infections and fatalities. Scene 3 deviates from scene 1 and 2 as it provides information on a more granular level, however color schemes are kept consistent to ensure that users can maintain their bearings. 

## Scenes
There are 3 key scenes present within this narrative visualization:
1. State-wide Policy Impact on Pandemic Spread
2. State-wide Policy Impact on Pandemic Fatalities
3. State Wide Pandemic Spread and Fatalities OverTime

The first scene describes the impact of looser and tighter restrictions on pandemic spread. This scene was placed first as it provides an intuitive overlay that tougher and stricter policies can decrease infections. This was placed before scene 2 because the decrease in infections ratios due to stricter policies were much more pronounced than for fatality ratio. Therefore, scene 1 helps draw the users in immediately by showcasing an obvious benefit. Next we show the impact of policies on curbing the fatality ratio in scene 2. While the impact is less pronounced than in scene 1, we still see a drop in fatality ratio when enacting policies that help reduce contact and increasing vaccinations. 

Both of these 2 scenes provide an overview that tougher policies can help reduce both infections and fatalities. Once the user has understood this, scene 3 can help demonstrate more information regarding timing of the policies. Scene 3 shows that stricter states enact more contact reduction policies and vaccination policies prior to the peak of an infectious period rather than during the peak in order to mitigate sharp increases. Additionally, users can look through the exact social measures that were implemented by perusing the table below. Scene 3 was placed at the end because users will not understand its value without first seeing the benefits of stricter policies demonstrated in scenes 1 and 2.

## Annotations
There are several annotations marked throughout the narrative visualization.
1. In scene 1, there are 2 annotations that are marked within the boxplot without any user interaction. It shows that stricter states reduce the infection ratio & it indicates that stricter states enact more policies, not just strict policies. Additionally users can hover over the boxplot to get the number of strict/moderate/lax states and the average infection ratio for that state category.
2. Scene 2 follows a very similar annotation style to scene 1 to ensure visual consistency. However, rather than showing the stricter states reduce the infection ratio, scene 2 shows that stricter states reduce fatality ratios. Additionally users can hover over the boxplot to get the number of strict/moderate/lax states and the average fatality ratio for the states in that category.
3. Scene 3 breaks the visual consistency of scenes 1 and 2 as it conveys a different messages than them. Scene 3 shows annotations marking when a specific policy type was enacted on the same x-axis as the line plot itself. Therefore, users can easy see, in relation to when the pandemic was spreading more, when specific policy types were enacted. Additionally, users can hover over the lineplot to get a tooltip containing the number of infections/fatalities on that specific day.

## Parameters
The only global parameter across the application is the navigation bar itself. It controls which scene a user is looking at. However, there are several parameters within each of the scenes that work within that scene.
- In scene 1, the only parameter present is which group of states is selected within the boxplot. This parameter controls what information is viewed within the table to the right.
- In scene 2, the only parameter present is which group of states is selected within the boxplot. This parameter controls what information is viewed within the table to the right.
- In scene 3, there are 2 parameters present. The first parameter indicates what state to view the data in the lineplot for. The second parameter indicates what metric to view (New Infections or New Cases). For visual consistency, both of these parameters are placed at the top. The combination of these 2 parameters result in the lineplot contents shown. The "state" parameter changes both the policy anntotations and the lineplot itself. The "metrics" parameter modifies only the lineplot itself.

## Triggers
The only global trigger affects the navigation bar itself. This trigger is controlled by a click.
- In scene 1, there are 2 triggers. The first is a mouse-over which triggers a tooltip to pop up. The second is an on-click event which triggers a panel to the right that provides additional information. The on-click event also changes the color of the boxplot to a slighter darker shade of green/blue to indicate that the boxplot was clicked. The other boxplots will also be reverted back to the original color after the on-click event.
- In scene 2, there are 2 triggers. The first, again, is a mouse-over which triggers a tooltip window. The second is an on-click event which, again, triggers a panel to the right that provides additional information. The on-click event also changes the color of the boxplot to a slightly darker shade of red to indicate that the boxplot was clicked. The other boxplots will also be reverted back to the original color after the on-click event.
- In scene 3, there are 3 triggers. The first is a mouse-over the line within the lineplot, which triggers a tooltip window that showcases the number of infections/fatalities on that specific timestamp. The second trigger is based on an on-change in the "states" dropdown menu which changes both the lineplot as well as the annotations present within the lineplot. The third trigger is based on an on-change in the "metrics" dropdown menu which changes only the lineplot without making any changes to the annotations within the lineplot. This is because the policies that were enacted are not subject to change depending on which metrics are viewed.

In scenes 1 and 2, the text to the right of the boxplot give information on what triggers are available within the scene.
In scene 3, the text above the lineplot indicate what triggers are available to change the lineplot.
