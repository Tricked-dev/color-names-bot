import {
  CommandHandler,
  useDescription,
  useNumber,
  createElement,
  Message,
  useString,
} from "slshx";

// `Env` contains bindings and is declared in types/env.d.ts
export function color(): CommandHandler<Env> {
  useDescription("Change the color of your name");
  const ign = useString("ign", "Your IGN", { required: true });
  const color = useString("color", "The color you want", {
    required: true,
    choices: [
      { name: "DarkRed", value: "4" },
      { name: "Red", value: "c" },
      { name: "Gold", value: "6" },
      { name: "Yellow", value: "e" },
      { name: "DarkGreen", value: "2" },
      { name: "Green", value: "a" },
      { name: "Aqua", value: "b" },
      { name: "DarkAqua", value: "3" },
      { name: "DarkBlue", value: "1" },
      { name: "Blue", value: "9" },
      { name: "LightPurple", value: "d" },
      { name: "DarkPurple", value: "5" },
      { name: "White", value: "f" },
      { name: "Gray", value: "7" },
      { name: "DarkGray", value: "8" },
      { name: "Black", value: "0" },
    ],
  });
  const cuteName = useString("profile", "Profile to use", { required: false });
  return async (interaction, env, ctx) => {
    //turn get all necessary data from sky.shiiyu.moe api
    const profile: any = await fetch(
      `https://sky.shiiyu.moe/api/v2/profile/${ign}`
    )
      .then((res) => res.json())
      .then((x: any) => Object.values(x.profiles))
      .then(
        (res: any[]) =>
          res.find((x: any) => x.cute_name === cuteName) ||
          res.find((x: any) => x.current) ||
          res[0]
      );
    if (!profile) {
      return (
        <Message ephemeral>
          Could not find a skyblock profile for that IGN
        </Message>
      );
    }

    const hypixelTag: string | undefined = profile?.data?.social?.DISCORD;

    const weight = profile?.data?.weight;
    const lillyWeight: number = weight?.lily?.total;
    const senitherWeight: number = weight?.senither?.overall;

    if (!hypixelTag)
      return (
        <Message ephemeral>
          Could not find a discord tag for that IGN make sure you have your
          connections right
        </Message>
      );

    //create the tag variable dont forget the add zeros before the discriminator if its less than 4 chars
    const userTag = `${
      interaction.member?.user.username
    }#${`0000${interaction.member?.user.discriminator}`.slice(-4)}`;
    //check if the user is the one who is trying to change their name
    if (hypixelTag !== userTag)
      return (
        <Message ephemeral>
          You can only change your own name, not someone elses
        </Message>
      );

    if (
      !interaction.member?.premium_since &&
      lillyWeight < 10000 &&
      senitherWeight < 10000
    ) {
      return (
        <Message ephemeral>
          You need to be a nitro booster or have 10k lilly weight or 10k
          senither weight
        </Message>
      );
    }
    // edit the file https://github.com/<user/repo>/blob/main/data.json
    // using the github api
    // first fetch the data and then edit data.colourednames.<username> to the color in the color variable
    const dataData = await fetch(
      `https://api.github.com/repos/${GITHUB_REPOSITORY}/contents/data.json`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          "user-agent": "coolbot ( https://tricked.dev )",
        },
      }
    )
      .then((res) => res.json())
      .then((res: any) => res);

    const data = JSON.parse(atob(dataData.content));
    data.colourednames[ign] = color;

    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPOSITORY}/contents/data.json`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
          "user-agent": "coolbot ( https://tricked.dev )",
        },
        body: JSON.stringify({
          message: `Added ${ign} to the list of colored names`,
          content: btoa(JSON.stringify(data, undefined, 2)),
          sha: dataData.sha,
          committer: {
            name: "🤖 username adder bot 🤖",
            email: "coolbot@tricked.dev",
          },
        }),
      }
    );
    return (
      <Message ephemeral>
        {res.status === 200
          ? "Successfully added your name to the list"
          : `Something went wrong: status ${res.status}`}
      </Message>
    );
  };
}

