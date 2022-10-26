import { AnimationClip, GameObject, MeshRenderer, Transform, WaitForSeconds, WaitUntil } from "UnityEngine";
import { SpawnInfo, ZepetoCharacter, ZepetoCharacterCreator } from "ZEPETO.Character.Controller";
import { ZepetoScriptBehaviour } from "ZEPETO.Script";


export default class VideoTest extends ZepetoScriptBehaviour {

    @SerializeField() private _npcID: string[];
    @SerializeField() private npcAnimation: AnimationClip[];

    @SerializeField() private waitTime: float;

    private npcCharacter:ZepetoCharacter[];
    private index:number;
    private npcTransform: Transform[];
    
    Start() {
        this.StartCoroutine(this.Init());
    }
    
    * Init() {
        this.npcTransform = new Array<Transform>(this.gameObject.transform.childCount);
        for(let i = 0 ; i < this.gameObject.transform.childCount ; i++){
            this.npcTransform[i] = this.gameObject.transform.GetChild(i).transform;
        }

        if(this._npcID.length != this.npcTransform.length)
            console.log('등록한 NPC아이디 개수와 NPCTransform 개수가 맞지 않습니다.');

        this.npcCharacter = new Array<ZepetoCharacter>(this._npcID.length);
        for(let i = 0 ; i < this.npcTransform.length ; i++){
            if(this.npcTransform[i].gameObject.GetComponent<MeshRenderer>() != null)
                GameObject.Destroy(this.npcTransform[i].gameObject.GetComponent<MeshRenderer>());
        }

        this.SpwanNPC();

        yield new WaitUntil(() => {
            if(this.npcCharacter[this.npcCharacter.length - 1] != null){
                return true;
            }
            return false;
        });

        yield new WaitForSeconds(1);

        this.index = 0;
        this.StartCoroutine(this.AnimationPlay());
    }

    SpwanNPC(){ // 캐릭터 스폰
        for(let i:number = 0 ; i < this._npcID.length; i++){
            var npcSpawnInfo = new SpawnInfo();
            npcSpawnInfo.position = this.npcTransform[i].position;
            npcSpawnInfo.rotation = this.npcTransform[i].rotation;
            ZepetoCharacterCreator.CreateByZepetoId(this._npcID[i],npcSpawnInfo,(character : ZepetoCharacter)=>
            {
                this.npcCharacter[i] = character;
            });
        }
    }

    *AnimationPlay(){
        for(let i:number = 0 ; i < this._npcID.length ; i++){
            if(this.npcCharacter[i] != null){
                this.npcCharacter[i].SetGesture(this.npcAnimation[this.index]);
            }
            else{
                console.log(i + '번 캐릭터 없음');
            }
         }

        yield new WaitForSeconds(this.npcAnimation[this.index].length);

        yield new WaitForSeconds(this.GetWaitTime());
        
        if(this.index == this.npcAnimation.length - 1){
            this.index = 0;
        }else{
            this.index ++;
        }

        this.StartCoroutine(this.AnimationPlay());
    }
    
    private GetWaitTime(): float{
        if(this.waitTime < 0)
            this.waitTime = 0;
        return this.waitTime;
    }

}