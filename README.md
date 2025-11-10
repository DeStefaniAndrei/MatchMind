Real-Time Sports Fan Staked Token Prediction Battles for the Chiliz Paris Hackathon 2025

## Deployment

Project is live at:

**[https://vercel.com/destefaniandrei2-5621s-projects/v0-matchmind-dapp-design](https://vercel.com/destefaniandrei2-5621s-projects/v0-matchmind-dapp-design)**


--------------Configs-----------------------
Questions configure with gloabal variables in ctor of real time question service ~Line 50


----------------NOTES-----------------------------
User Ids are stored localy so even anonymous restore between instance if browser keeps cache

    -----------Questions
    Submited question are stored localy on browser
    All user are given diffrent questions 
    question that are not sumbited are stored server side on at a time
    Come in three forms:
        -will more than x <eventype> happen in next min
        -will less than x <eventtype> happeing in next min
        -will a <eventtype> happen in the next min (these are more question types under the hood but are generate diffrently (Rare events use these))
